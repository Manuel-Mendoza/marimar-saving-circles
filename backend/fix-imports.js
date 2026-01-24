import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join } from 'path';

async function fixImports(dir) {
  const files = await readdir(dir);
  
  for (const file of files) {
    const filePath = join(dir, file);
    const stats = await stat(filePath);
    
    if (stats.isDirectory()) {
      await fixImports(filePath);
    } else if (file.endsWith('.js')) {
      const content = await readFile(filePath, 'utf8');
      const fixedContent = content.replace(
        /from\s+["']([^"']+)["']/g,
        (match, path) => {
          if (path.startsWith('./') || path.startsWith('../')) {
            if (!path.endsWith('.js')) {
              return match.replace(path, path + '.js');
            }
          }
          return match;
        }
      );
      
      if (content !== fixedContent) {
        await writeFile(filePath, fixedContent);
        console.log(`Fixed imports in: ${filePath}`);
      }
    }
  }
}

fixImports('./dist').catch(console.error);