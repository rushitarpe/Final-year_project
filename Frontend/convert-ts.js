/**
 * TypeScript to JavaScript Converter Script
 * Reads all .ts/.tsx files in src, strips TypeScript syntax, writes .js/.jsx equivalents, then deletes originals.
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, 'src');

const warnings = [];

/**
 * Strip TypeScript type annotations from content
 */
function stripTypeScript(content) {
    let js = content;

    // Remove triple-slash references
    js = js.replace(/\/\/\/\s*<reference[^>]*\/>/g, '');

    // Remove vite-env.d.ts content (all d.ts references)
    if (js.match(/^\/\/\/ <reference/)) return '';

    // 1. Remove type/interface declarations
    js = js.replace(/^(export\s+)?(interface|type)\s+\w[\w\s<>,=|&\[\]{}(?:)`'"]*\{[^}]*\}/gms, '');

    // 2. Remove inline type imports
    // "import type { X } from '...'" or "import { type X, Y } from '...'"
    js = js.replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\n?/g, '');
    js = js.replace(/,\s*type\s+\w+/g, '');
    js = js.replace(/type\s+\w+\s*,\s*/g, '');

    // 3. Remove "type X = ..." type aliases
    js = js.replace(/^export\s+type\s+\w+\s*=.*?;/gms, '');
    js = js.replace(/^type\s+\w+\s*=.*?;/gms, '');

    // 4. Remove TypeScript generics from function calls, useState, createContext, etc.
    // Ex: useState<boolean>(false) -> useState(false), createContext<Foo>(null) -> createContext(null)
    // We'll do multiple passes for nested generics
    for (let i = 0; i < 5; i++) {
        js = js.replace(/<(?:[^<>'"`]|'[^']*'|"[^"]*"|`[^`]*`)*>/g, (match) => {
            // Keep JSX tags (starts with uppercase or known elements)
            if (/^<[A-Z]/.test(match) || /^<\/[A-Z]/.test(match)) return match;
            // Keep JSX-like self-closing
            if (/\/>$/.test(match)) return match;
            // Strip TS generics
            return '';
        });
    }

    // 5. Remove TypeScript type annotations on variables and params
    // E.g., const x: string = ... or function foo(a: string, b: number) { }
    // Remove after colon in parameter/variable declarations
    // This step is intentionally simple/conservative
    js = js.replace(/:\s*(?:string|number|boolean|void|any|never|unknown|null|undefined|object|symbol|bigint)\b/g, '');
    js = js.replace(/:\s*Promise<[^>]*>/g, '');
    js = js.replace(/:\s*React\.FC<[^>]*>/g, '');
    js = js.replace(/:\s*React\.FC/g, '');
    js = js.replace(/:\s*React\.ReactNode/g, '');
    js = js.replace(/:\s*ReactNode/g, '');
    js = js.replace(/:\s*React\.MouseEvent<[^>]*>/g, '');
    js = js.replace(/:\s*React\.ChangeEvent<[^>]*>/g, '');
    js = js.replace(/:\s*React\.FormEvent<[^>]*>/g, '');
    js = js.replace(/:\s*React\.RefObject<[^>]*>/g, '');
    js = js.replace(/:\s*Socket\s*\|\s*null/g, '');
    js = js.replace(/:\s*\w+\s*\|\s*null/g, '');
    js = js.replace(/:\s*\w+\s*\|\s*undefined/g, '');
    js = js.replace(/:\s*\w+\[\]/g, '');
    js = js.replace(/:\s*\(\)\s*=>\s*void/g, '');
    js = js.replace(/:\s*\(\)\s*=>\s*Promise<void>/g, '');
    js = js.replace(/:\s*\([^)]*\)\s*=>\s*[^,\n;{]+/g, '');
    
    // 6. Remove "as X" type assertions
    js = js.replace(/\s+as\s+\w+/g, '');
    js = js.replace(/\bas\s+any\b/g, '');
    js = js.replace(/\bas\s+string\b/g, '');
    js = js.replace(/\bas\s+number\b/g, '');
    js = js.replace(/\bas\s+unknown\b/g, '');

    // 7. Remove non-null assertions (!)
    // Only remove trailing ! that are TS non-null assertions, not JSX !
    js = js.replace(/\)!/g, ')');
    js = js.replace(/\]!/g, ']');
    js = js.replace(/\.getElementById\([^)]+\)!/g, (m) => m.replace(/!$/, ''));

    // 8. Remove "private", "public", "protected" keywords from class members
    js = js.replace(/\b(private|protected|public|readonly|abstract|override)\s+/g, '');

    // 9. Remove @ts-ignore, @ts-nocheck, @ts-expect-error
    js = js.replace(/\/\/\s*@ts-[a-z-]+\n/g, '');

    // 10. Fix import paths from .tsx/.ts to .jsx/.js
    js = js.replace(/from\s+(['"])(.*?)\.tsx?(['"])/g, (match, q1, p, q2) => `from ${q1}${p}${q2}`);
    js = js.replace(/(import\s+['"])(.*?)\.tsx?(['"])/g, (match, q1, p, q2) => `${q1}${p}${q2}`);
    // Also remove explicit .tsx from JSX imports inside code  
    js = js.replace(/('\.\/[^'"]*?)\.tsx(')/g, "$1$2");
    js = js.replace(/("\.\/[^'"]*?)\.tsx(")/g, "$1$2");

    return js;
}

function processFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const ext = path.extname(filePath);
    
    const newExt = ext === '.tsx' ? '.jsx' : '.js';
    const newPath = filePath.replace(/\.(tsx|ts)$/, newExt);
    
    let newContent = stripTypeScript(content);
    
    fs.writeFileSync(newPath, newContent, 'utf8');
    
    // Delete original
    fs.unlinkSync(filePath);
    
    console.log(`✅ Converted: ${path.relative(SRC_DIR, filePath)} → ${path.relative(SRC_DIR, newPath)}`);
}

function walkDir(dir, skip = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath, skip);
        } else if ((entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) && !entry.name.endsWith('.d.ts')) {
            processFile(fullPath);
        }
    }
}

console.log('🔄 Converting TypeScript → JavaScript...\n');
walkDir(SRC_DIR);
console.log('\n✅ All files converted!');
if (warnings.length > 0) {
    console.log('\n⚠️ Warnings:');
    warnings.forEach(w => console.log('  ' + w));
}
