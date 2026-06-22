portafolio de Ricardo guevara

Firebase integration
--------------------
This project now includes an automatic Firebase initialization (anonymous auth + Firestore) to persist ranking and student states remotely.

What was added
- Firebase compat v8 scripts and initialization in `index.html` (anonymous sign-in).
- `mosbot-logic.js` updated to read/write student documents in `mosbot_students` using the anonymous `uid` when available.

How to review / change
1. If you want to use a different Firebase project, replace the `firebaseConfig` object in `index.html` with your project's config.
2. Firestore rules for quick testing (open Firestore → Rules and paste):

```
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /mosbot_students/{docId} {
			allow read, write: if true;
		}
	}
}
```

For production, secure rules and enable proper Authentication (email or anonymous with restrictions) before deploying.

Notes
- The app will sign in users anonymously and save their progress under the anonymous `uid`. If a user previously had a local-only account by name, data may be duplicated; you can migrate manually by copying data in the Firebase console.
- To disable remote saving, remove the Firebase scripts from `index.html`.
