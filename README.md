# Simple Blog CLI

```
  ____  _                 _        _     _                    _ _
 / ___|(_)_ __ ___  _ __ | | ___  | |__ | | ___   __ _    ___| (_)
 \___ \| | '_ ` _ \| '_ \| |/ _ \ | '_ \| |/ _ \ / _` |  / __| | |
  ___) | | | | | | | |_) | |  __/ | |_) | | (_) | (_| | | (__| | |
 |____/|_|_| |_| |_| .__/|_|\___| |_.__/|_|\___/ \__, |  \___|_|_|
                   |_|                           |___/
```

## Description

Simple Blog CLI is an application designed to manage blog posts through the cli. It allows users to carry out crud operations on posts.

## Features

- **Create Post**: Easily create new blog posts.
- **View Post**: View the content of existing posts (both in block and tabular view).
- **Edit Post**: Modify the content of existing posts.
- **Delete Post**: Permanently delete posts.

## Setup

1. Clone it:
   ```bash
   git clone https://github.com/jvstln/simple-blog-cli.git
   ```
2. Move in:
   ```bash
   cd simple-blog-cli
   ```
3. Install:
   ```bash
   npm install
   ```

## Usage

Start the CLI by running:

```bash
npm start
```

Follow the on-screen prompts to manage your blog posts. Every post is managed locally (in ./post.json file)

## Packages Used

- [@inquirer/prompts](https://www.npmjs.com/package/@inquirer/prompts)
- [yoctocolors-cjs](https://www.npmjs.com/package/yoctocolors-cjs)
