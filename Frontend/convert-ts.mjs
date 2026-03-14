/**
 * TypeScript to JavaScript Converter Script (ES Module compatible)
 */
import { readFileSync, writeFileSync, unlinkSync, readdirSync } from 'fs';
import { join, extname, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SRC_DIR = join(__dirname, 'src');

function stripTypeScript(content) {
    let js = content;

    // Remove type/interface declarations (multi-line)
    js = js.replace(/^(export\s+)?(interface|type)\s+\w[\w\s<>,=|&\[\]{}(?:)`'"]*\{[^}]*\}/gms, '');

    // Remove type aliases
    js = js.replace(/^export\s+type\s+\w+\s*=.*?;/gms, '');
    js = js.replace(/^type\s+\w+\s*=.*?;/gms, '');

    // Remove import type statements
    js = js.replace(/import\s+type\s+\{[^}]*\}\s+from\s+['"][^'"]+['"];?\n?/g, '');

    // Remove inline type from imports: { type X, Y } -> { Y }
    js = js.replace(/,\s*type\s+\w+/g, '');
    js = js.replace(/\{\s*type\s+\w+\s*,\s*/g, '{ ');

    // Remove TypeScript generics from function calls/hooks
    const removeGenerics = (str) => {
        // Repeatedly remove angle brackets that aren't JSX
        let prev = '';
        while (prev !== str) {
            prev = str;
            // Matches <...> where content is not empty and doesn't look like JSX
            str = str.replace(/<(?:(?!=>)(?!<[A-Z])[^<>])*>/g, (match) => {
                // Keep obvious JSX like <div>, <Component />, </div>
                if (/^<\/?[A-Za-z]/.test(match) && (/\s/.test(match) || match.endsWith('>') && !match.includes('='))) {
                    // Simple check - if it has attributes or is a tag, keep it
                    if (match.match(/^<[A-Za-z][A-Za-z0-9]*(\s|>|\/)/)) return match;
                }
                return '';
            });
        }
        return str;
    };
    js = removeGenerics(js);

    // Remove TypeScript type annotations on params/variables
    const primitives = 'string|number|boolean|void|any|never|unknown|null|undefined|object|symbol|bigint';
    js = js.replace(new RegExp(`:\\s*(?:${primitives})(?=\\s*[,)=;\\n{])`, 'g'), '');
    js = js.replace(/:\s*Promise<[^>]*>/g, '');
    js = js.replace(/:\s*React\.FC(?:<[^>]*>)?/g, '');
    js = js.replace(/:\s*React\.ReactNode/g, '');
    js = js.replace(/:\s*ReactNode/g, '');
    js = js.replace(/:\s*React\.[A-Z][A-Za-z]+(?:<[^>]*>)?/g, '');
    js = js.replace(/:\s*Socket\s*\|\s*null/g, '');
    js = js.replace(/:\s*\w+\s*\|\s*null/g, '');
    js = js.replace(/:\s*\w+\s*\|\s*undefined/g, '');
    js = js.replace(/:\s*\w+\[\]/g, '');
    js = js.replace(/:\s*\(\)\s*=>\s*void/g, '');
    js = js.replace(/:\s*\(\)\s*=>\s*Promise<[^>]*>/g, '');
    js = js.replace(/:\s*(?:\w+\.)*\w+(?:<[^>]*>)?(?:\s*\|\s*(?:\w+\.)*\w+(?:<[^>]*>)?)*/g, '');

    // Remove "as Type" type assertions
    js = js.replace(/\s+as\s+(?:any|string|number|boolean|unknown|never|\w+)/g, '');

    // Remove non-null assertions after ) and ]
    js = js.replace(/([)\]])\!/g, '$1');
    js = js.replace(/getElementById\(([^)]+)\)\!/g, 'getElementById($1)');

    // Remove TypeScript-only class modifiers
    js = js.replace(/\b(private|protected|public|readonly|abstract|declare|override)\s+/g, '');

    // Remove @ts-* comments
    js = js.replace(/\/\/\s*@ts-[a-z-]+.*\n/g, '');

    return js;
}

function processFile(filePath) {
    const content = readFileSync(filePath, 'utf8');
    const ext = extname(filePath);
    const newExt = ext === '.tsx' ? '.jsx' : '.js';
    const newPath = filePath.replace(/\.(tsx|ts)$/, newExt);

    // Skip .d.ts files - just delete them
    if (filePath.endsWith('.d.ts')) {
        unlinkSync(filePath);
        console.log(`🗑️  Deleted: ${relative(SRC_DIR, filePath)}`);
        return;
    }

    const newContent = stripTypeScript(content);
    writeFileSync(newPath, newContent, 'utf8');
    unlinkSync(filePath);
    console.log(`✅ Converted: ${relative(SRC_DIR, filePath)} → ${relative(SRC_DIR, newPath)}`);
}

function walkDir(dir) {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath);
        } else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
            processFile(fullPath);
        }
    }
}

console.log('🔄 Converting TypeScript → JavaScript...\n');
walkDir(SRC_DIR);
console.log('\n✅ All files converted!');
