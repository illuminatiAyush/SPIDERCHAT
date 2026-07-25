const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "client/src/components/UserList.tsx",
  "client/src/components/ToastProvider.tsx",
  "client/src/components/RoomHeader.tsx",
  "client/src/components/RoomAdminModal.tsx",
  "client/src/components/MessageInput.tsx",
  "client/src/app/terms/page.tsx",
  "client/src/app/support/page.tsx",
  "client/src/app/status/page.tsx",
  "client/src/app/security/page.tsx",
  "client/src/app/privacy-policy/page.tsx",
  "client/src/app/dashboard/profile/page.tsx",
  "client/src/app/dashboard/settings/page.tsx",
  "client/src/app/dashboard/notifications/page.tsx",
  "client/src/app/dashboard/friends/page.tsx",
  "client/src/app/dashboard/explore/page.tsx",
  "client/src/app/admin/page.tsx"
];

filesToUpdate.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    // Replace all text-foreground with text-spider-black in these files.
    // They are all light-themed panels or buttons that use bg-spider-white or bg-white.
    content = content.replace(/text-foreground/g, 'text-spider-black');
    
    if (content !== original) {
      fs.writeFileSync(filePath, content);
      console.log(`Updated: ${file}`);
    }
  } else {
    console.log(`File not found: ${file}`);
  }
});
