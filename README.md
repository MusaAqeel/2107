# About Mixify

Mixify enhances Spotify's auto-generated playlists by enabling users to create custom playlists based on specific prompts like mood, genre, or artist. Leveraging a large language model (LLM) and Spotify's API, Mixify instantly generates tailored playlists accessible through an intuitive web interface.

https://drive.google.com/file/d/1WUcJNKNHFH9Mnk5QOQb4rSr7dh01ExCd/view?usp=sharing

# Quick Start Guide

1. Install `pnpm` globally:

   ```bash
   npm install -g pnpm
   ```

2. Clone the repo:

   ```bash
   git clone https://github.com/MusaAqeel/2107.git
   cd app
   ```

3. Install dependencies:

   ```bash
   pnpm install
   ```

4. Start the development server:

   ```bash
   pnpm run dev
   ```

## Contributing Guide

- **Branch Naming**: Use `[first initial][lastname]/dev/[feature]`.
  - Example: `maqeel/dev/add-login-page`
- **Pull Requests**: Assign each PR to a relevant descriptive issue.
- **Merge Process**:
  - 2 approval required to merge into `staging` (development) branch.
  - 2 approvals required to merge into `prod` (production).2
- **Project Progress**: Track updates on the [project board](https://github.com/users/MusaAqeel/projects/6/).

## Branch Strategy for TDD

1. **Create a feature branch from `staging`** (development branch) and write your test cases and code there.

   ```bash
   git checkout staging
   git checkout -b maqeel/dev/auth-test-cases
   ```

2. **Create a branch with the same name from `prod`** (production branch, initially empty) and copy only the test cases over.

   ```bash
   git checkout prod
   git checkout -b maqeel/dev/auth-test-cases
   ```

3. **Push the tests to `prod`** and make a pull request, noting the files being tested.

   ```bash
   git add path/to/tests
   git commit -m "Add authentication test cases"
   git push origin maqeel/dev/auth-test-cases
   ```

4. **After merging tests into `prod`**, commit the corresponding code from `staging` to `prod` to pass each test. (Musa will handle this.)
