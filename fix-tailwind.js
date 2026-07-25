const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(path.join(__dirname, 'client', 'src'));
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Replace bg-surface with bg-spider-white
  content = content.replace(/bg-surface/g, 'bg-spider-white');
  
  // Replace bg-background with bg-spider-black
  content = content.replace(/bg-background/g, 'bg-spider-black');
  
  // Replace border-comic-border with border-black
  content = content.replace(/border-comic-border/g, 'border-black');

  // For text-foreground, if it's generally dark mode, we replace it with text-spider-white
  // But wait, if it's inside a bg-spider-white container, it should be text-spider-black.
  // This is tricky for regex. 
  // Let's replace text-foreground with text-spider-white by default, EXCEPT:
  // We'll manually review or run a second pass. For now, let's just do the backgrounds and borders.
  
  if (content !== original) {
    fs.writeFileSync(file, content);
    changedFiles++;
    console.log(`Updated: ${file}`);
  }
});

console.log(`Replaced in ${changedFiles} files.`);
