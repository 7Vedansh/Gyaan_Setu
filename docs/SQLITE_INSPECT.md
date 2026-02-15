# Inspecting the SQLite database

## 1. In the app (easiest)

On the **Quiz** tab you’ll see a **“Stored quiz results (from DB)”** block. It lists the last 10 quiz attempts read from SQLite. If you see rows there after submitting a quiz, data is being inserted correctly.

---

## 2. Command-line: `sqlite3`

Use the official [SQLite CLI](https://www.sqlite.org/cli.html) to open the `.db` file and run SQL.

### Install `sqlite3`

- **Windows**: Install from [sqlite.org/downloads](https://www.sqlite.org/download.html) (e.g. “Precompiled Binaries for Windows” → `sqlite-tools-*.zip`), or with Chocolatey: `choco install sqlite`.
- **macOS**: `brew install sqlite`
- **Linux**: `sudo apt install sqlite3` (Debian/Ubuntu) or equivalent.

### Where is the database file?

The app uses **expo-sqlite**. The DB file is:

- **Path on device/simulator**: `<app document directory>/SQLite/app.db`
- **Name**: `app.db`

So you need to copy that file to your PC first, then open it with `sqlite3`.

### Get the DB from the device

**Android (device/emulator)**

1. Find the app’s data path (Expo Go: `host.exp.Exponent`; your dev build: your package id).
2. Pull the DB (emulator/rooted device; path may vary):
   ```bash
   adb exec-out run-as host.exp.Exponent cat files/SQLite/app.db > app.db
   ```
   If that fails, try:
   ```bash
   adb pull /data/data/host.exp.Exponent/files/SQLite/app.db ./app.db
   ```
   (Often needs a debuggable/run-as setup.)
3. Open it locally:
   ```bash
   sqlite3 app.db
   ```

**iOS Simulator**

1. Get the app container path:
   ```bash
   xcrun simctl get_app_container booted host.exp.Exponent data
   ```
2. The DB is at: `<that-path>/Documents/SQLite/app.db`
3. Copy it to your machine, then:
   ```bash
   sqlite3 /path/to/app.db
   ```

### Useful `sqlite3` commands

```bash
sqlite3 app.db
```

Then inside the prompt:

```text
.tables                    # list tables
.schema quiz_results       # show CREATE TABLE for quiz_results
SELECT * FROM quiz_results; # show all quiz attempts
.quit                      # exit
```

Example queries:

```sql
SELECT id, quiz_id, score, total_questions, datetime(created_at/1000,'unixepoch') FROM quiz_results;
```

(Note: `created_at` is stored as milliseconds since epoch; the above converts it for display.)
