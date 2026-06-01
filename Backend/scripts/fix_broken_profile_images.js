/**
 * Migration: Clear broken Cloudinary profileImage URLs
 *
 * These mentor records were seeded with Cloudinary URLs pointing to files
 * that were never actually uploaded (e.g. mentor_connect/avatars/mentor14).
 * Cloudinary returns HTTP 404 for all of them, causing noisy console errors.
 *
 * This script sets profileImage = '' for every Mentor/Mentee/User whose
 * profileImage value is a Cloudinary URL that Cloudinary cannot find.
 *
 * Run once from the backend directory:
 *   node scripts/fix_broken_profile_images.js
 */

require('dotenv').config();
const mongoose = require('mongoose');
const https = require('https');

// ── DB connection ──────────────────────────────────────────────────────────────
async function connectDB() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
}

// ── Check if a Cloudinary URL is alive (HEAD request) ─────────────────────────
function checkUrl(url) {
    return new Promise((resolve) => {
        const req = https.request(url, { method: 'HEAD' }, (res) => {
            resolve(res.statusCode);
        });
        req.on('error', () => resolve(0));
        req.setTimeout(5000, () => { req.destroy(); resolve(0); });
        req.end();
    });
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
    await connectDB();

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Find all documents that have a Cloudinary profileImage
    const docs = await collection.find({
        profileImage: { $regex: /^https?:\/\/res\.cloudinary\.com\//i }
    }, { projection: { _id: 1, profileImage: 1, firstName: 1, role: 1 } }).toArray();

    console.log(`\n🔍 Found ${docs.length} document(s) with Cloudinary profileImage URLs`);

    if (docs.length === 0) {
        console.log('✨ Nothing to fix — database is clean!');
        process.exit(0);
    }

    let fixed = 0;
    let skipped = 0;

    for (const doc of docs) {
        process.stdout.write(`  Checking [${doc.firstName || doc._id}] ${doc.profileImage.slice(0, 70)}... `);
        const status = await checkUrl(doc.profileImage);

        if (status === 200) {
            console.log('✅ OK (keeping)');
            skipped++;
        } else {
            console.log(`❌ HTTP ${status || 'timeout'} → clearing`);
            await collection.updateOne(
                { _id: doc._id },
                { $set: { profileImage: '' } }
            );
            fixed++;
        }
    }

    console.log(`\n🎉 Done! Cleared ${fixed} broken URL(s), kept ${skipped} valid URL(s).`);
    process.exit(0);
}

main().catch((err) => {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
});
