# Gyaan Setu: Learning Languages

Gyaan Setu is a fun and interactive language learning app, designed to make learning a new language enjoyable and effective. Similar to Duolingo, Gyaan Setu offers a user-friendly experience for language enthusiasts of all levels.

## Features

- **Engaging Lessons:** Learn languages through interactive and gamified lessons.
- **Progress Tracking:** Monitor your progress with intuitive statistics and milestones.
- **Rewards and Achievements:** Earn rewards and achievements to stay motivated.
- **Multi-language Support:** Learn a variety of languages.
- **Community:** Connect with fellow learners in our community.

## Tech Stack

- React Native
- Expo
- Firebase

## Getting Started

Follow these steps to get Gyaan Setu up and running on your local machine:

1. **Clone the Repository:**

   ```
   git clone https://github.com/7Vedansh/Gyaan_Setu.git
   cd gyaan-setu
   ```

2. **Install Dependencies:**

   ```
   npm install
   ```

3. **Set Up Firebase:**

   - Create a Firebase project at [https://console.firebase.google.com/](https://console.firebase.google.com/).
   - Add your Firebase configuration in `firebase.js`.

4. **Start the App:**

   ```
   expo start
   ```

5. **Connect a Device or Emulator:**
   - Install the Expo Go app on your mobile device.
   - Use Expo CLI to run the app on an emulator.

6. **Change ip in D:\Gyaan_Setu\src\config\env.ts**
   - Use ```ipconfig``` command to get ip address
   - Insert IPv4 address in API_URL
```
Gyaan_Setu
├─ .eslintrc.js
├─ .prettierrc.js
├─ app.config.ts
├─ babel.config.js
├─ backend
│  ├─ config.py
│  ├─ docs
│  │  ├─ science.pdf
│  │  └─ science_marathi.pdf
│  ├─ ingest.py
│  ├─ main.py
│  ├─ offline_rag.py
│  ├─ online_model.py
│  ├─ requirements.txt
│  ├─ router.py
│  ├─ vector_store
│  │  ├─ science.json
│  │  └─ science_marathi.json
│  └─ __pycache__
├─ firebase.js
├─ metro.config.js
├─ package-lock.json
├─ package.json
├─ README.md
├─ src
│  ├─ app
│  │  ├─ (course)
│  │  │  ├─ animation.tsx
│  │  │  ├─ characters.tsx
│  │  │  ├─ leaderboards.tsx
│  │  │  ├─ learn.tsx
│  │  │  ├─ profile.tsx
│  │  │  ├─ quests.tsx
│  │  │  ├─ quiz
│  │  │  │  ├─ index.tsx
│  │  │  │  ├─ [id]
│  │  │  │  │  └─ index.tsx
│  │  │  │  └─ _layout.tsx
│  │  │  ├─ tutor.tsx
│  │  │  └─ _layout.tsx
│  │  ├─ (guest)
│  │  │  ├─ register.tsx
│  │  │  ├─ welcome.tsx
│  │  │  └─ _layout.tsx
│  │  ├─ (lesson)
│  │  │  ├─ lesson.tsx
│  │  │  └─ pratice
│  │  │     └─ [sectionId]
│  │  │        └─ [chapterId]
│  │  │           └─ [lessonId]
│  │  │              └─ [exerciseId]
│  │  │                 └─ index.tsx
│  │  ├─ (tabs)
│  │  │  ├─ index.tsx
│  │  │  ├─ profile.tsx
│  │  │  ├─ tutor.tsx
│  │  │  └─ _layout.tsx
│  │  ├─ +html.tsx
│  │  ├─ [...missing].tsx
│  │  └─ _layout.tsx
│  ├─ assets
│  │  ├─ audios
│  │  │  ├─ course
│  │  │  │  ├─ files
│  │  │  │  │  ├─ rice-jp-audio.mp3
│  │  │  │  │  ├─ sushi-jp-audio.mp3
│  │  │  │  │  ├─ tea-jp-audio.mp3
│  │  │  │  │  └─ water-jp-audio.mp3
│  │  │  │  └─ index.ts
│  │  │  └─ sound
│  │  │     ├─ files
│  │  │     │  ├─ correct.mp3
│  │  │     │  └─ wrong.mp3
│  │  │     └─ index.ts
│  │  ├─ fonts
│  │  │  └─ SpaceMono-Regular.ttf
│  │  ├─ images
│  │  │  ├─ adaptive-icon.jpg
│  │  │  ├─ favicon.png
│  │  │  ├─ icon.jpg
│  │  │  └─ splash.png
│  │  ├─ public
│  │  │  ├─ android-chrome-192x192.jpg
│  │  │  ├─ android-chrome-512x512.jpg
│  │  │  ├─ og.png
│  │  │  └─ site.webmanifest
│  │  ├─ science.json
│  │  └─ science_marathi.json
│  ├─ components
│  │  ├─ animations
│  │  │  └─ FractionPizza.tsx
│  │  ├─ container.tsx
│  │  ├─ course-details-bar.tsx
│  │  ├─ exercise
│  │  │  ├─ items
│  │  │  │  ├─ exercise-item-event.tsx
│  │  │  │  ├─ exercise-items.tsx
│  │  │  │  ├─ flash-card-item.tsx
│  │  │  │  └─ translate-item.tsx
│  │  │  └─ screens
│  │  │     ├─ exercise-outro.tsx
│  │  │     └─ exercise.tsx
│  │  ├─ icons.tsx
│  │  ├─ layouts
│  │  │  ├─ course-left-bar.tsx
│  │  │  ├─ course-right-bar.tsx
│  │  │  ├─ main-header.tsx
│  │  │  └─ mobile-tabs-bar.tsx
│  │  ├─ lesson-item.tsx
│  │  ├─ metadata.tsx
│  │  ├─ shell.tsx
│  │  ├─ status-bar.tsx
│  │  ├─ streak
│  │  │  ├─ FriendsStreak.tsx
│  │  │  ├─ PersonalStreak.tsx
│  │  │  └─ StreakModal.tsx
│  │  ├─ StreakBadge.tsx
│  │  ├─ themed.tsx
│  │  ├─ ui
│  │  │  ├─ Button.tsx
│  │  │  ├─ Card.tsx
│  │  │  ├─ Dialog.tsx
│  │  │  ├─ Input.tsx
│  │  │  └─ Text.tsx
│  │  └─ voice-assistant.tsx
│  ├─ config
│  │  ├─ course.ts
│  │  ├─ env.ts
│  │  ├─ language.ts
│  │  └─ site.ts
│  ├─ constants
│  │  ├─ colors.ts
│  │  ├─ default.ts
│  │  ├─ layouts.ts
│  │  └─ storage-key.ts
│  ├─ content
│  │  ├─ courses
│  │  │  ├─ data
│  │  │  │  ├─ characters
│  │  │  │  │  └─ index.ts
│  │  │  │  ├─ index.ts
│  │  │  │  └─ sections
│  │  │  │     └─ 1
│  │  │  │        ├─ chapters
│  │  │  │        │  └─ 1
│  │  │  │        │     ├─ index.ts
│  │  │  │        │     └─ lessons
│  │  │  │        │        └─ 1
│  │  │  │        │           ├─ exercises
│  │  │  │        │           │  └─ 1
│  │  │  │        │           │     └─ index.ts
│  │  │  │        │           └─ index.ts
│  │  │  │        └─ index.ts
│  │  │  └─ items
│  │  │     ├─ flashcard
│  │  │     │  └─ water.ts
│  │  │     └─ translate
│  │  │        └─ sushi-please.ts
│  │  └─ translations
│  │     ├─ common
│  │     │  └─ index.ts
│  │     └─ index.ts
│  ├─ context
│  │  ├─ breakpoints.tsx
│  │  ├─ course.tsx
│  │  ├─ language.tsx
│  │  ├─ protected-route.tsx
│  │  └─ theme.tsx
│  ├─ features
│  │  ├─ ai-tutor
│  │  │  └─ legacy
│  │  │     ├─ README.md
│  │  │     └─ TutorChat.tsx
│  │  ├─ learn
│  │  │  └─ Dashboard.tsx
│  │  └─ profile
│  │     └─ Profile.tsx
│  ├─ hooks
│  │  ├─ audio.ts
│  │  ├─ useCourseContent.ts
│  │  ├─ useFriendsStreak.ts
│  │  ├─ useOnlineStatus.ts
│  │  ├─ useStreak.ts
│  │  └─ useVoiceAssistant.ts
│  ├─ lib
│  │  ├─ local-storage.ts
│  │  ├─ mockAI.ts
│  │  ├─ offlineRag.ts
│  │  ├─ speech-api.d.ts
│  │  └─ utils.ts
│  ├─ services
│  │  ├─ api.service.ts
│  │  ├─ content.service.ts
│  │  ├─ course.service.ts
│  │  ├─ database.service.ts
│  │  ├─ microLesson.service.ts
│  │  ├─ quiz.service.ts
│  │  ├─ streak.service.ts
│  │  └─ sync.service.ts
│  ├─ store
│  │  ├─ useCourseStore.ts
│  │  └─ __tests__
│  │     └─ useCourseStore.test.ts
│  ├─ theme
│  │  └─ theme.ts
│  └─ types
│     ├─ course.d.ts
│     ├─ index.d.ts
│     └─ store.d.ts
├─ tsconfig.json
└─ vercel.json

```