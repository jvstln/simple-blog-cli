import fs from "node:fs/promises";
import colors from "yoctocolors-cjs"; // Package found from @inquirer/prompts
import { input, select, search, confirm, Separator } from "@inquirer/prompts";

/* This will contain and manage posts
Post format: { id, title, date, content, author } */
let posts = [];
const separate = () => console.log(new Separator().separator.repeat(4));
const delay = async (milliseconds = 1000) => {
  new Promise((res) => setTimeout(res, milliseconds));
};

const commitPostToFile = async () => {
  await fs.writeFile("./posts.json", JSON.stringify(posts));
};

const readPostsFromFile = async () => {
  try {
    const data = await fs.readFile("./posts.json", "utf8");
    posts = JSON.parse(data || "[]");
  } catch {
    await fs.writeFile("./posts.json", "[]");
    posts = [];
  }
};

const inquirePost = async (defaultPost) => {
  const title = await input({
    message: "Enter post title:",
    default: defaultPost.title,
  });

  const content = await input({
    message: "Enter post content:",
    default: defaultPost.content,
    validate: (content) => content.length > 0 || "Content cannot be empty",
  });

  const author = await input({
    message: "Enter post author:",
    default: defaultPost.author,
  });

  return { ...defaultPost, title, content, author };
};

const viewPost = async () => {
  const post = await getPost();

  if (!post) {
    console.log(colors.red("Post not found!"));
    return;
  }

  separate();
  console.log(colors.italic(`Viewing post: [id=${post.id}]...`));

  const viewMode = await select({
    message: "Select view mode:",
    choices: [
      { name: "Block", value: "block" },
      { name: "Table", value: "table" },
    ],
  });

  separate();
  if (viewMode === "table") {
    console.table(post);
    return;
  } else {
    console.log(`${colors.green("Post title:")} ${post.title}`);
    console.log(
      `${colors.green("Date:")} ${post.date ?? colors.italic("Unknown")}`
    );
    console.log(`\n${colors.green("Content:")} ${post.content}`);
    console.log(`${post.author ? colors.green("Author: ") + post.author : ""}`);
  }
  separate();
};

const createPost = async () => {
  const newPost = await inquirePost({
    id: Math.random().toString().slice(2),
    title: "Untitled post",
    author: "None",
  });

  separate();
  console.log(colors.italic("Creating post..."));

  posts.push({
    id: newPost.id,
    title: newPost.title,
    content: newPost.content,
    date: new Date().toLocaleString(),
    author: newPost.author === "None" ? undefined : newPost.author,
  });
  commitPostToFile();

  console.log(colors.green(`Post: [${newPost.title}] created successfully!`));
  separate();
  return newPost.id;
};

const editPost = async () => {
  const postToEdit = await getPost();

  if (!postToEdit) {
    console.log(colors.red("Post not found!"));
    return;
  }

  separate();
  console.log(
    colors.italic(
      `Editing post: [id=${postToEdit.id}]...(press ${colors.bold(
        "TAB"
      )} to edit, ${colors.bold("ENTER")} to skip)`
    )
  );

  const editedPost = await inquirePost(postToEdit);

  if (
    Object.keys(postToEdit).every((key) => editedPost[key] === postToEdit[key])
  ) {
    // If nothing changed in the update, skip the update
    console.log(colors.yellow("Nothing was updated"));
    separate();
    return;
  }

  editedPost.date = new Date().toLocaleString();
  Object.assign(postToEdit, editedPost);
  commitPostToFile();

  console.log(
    colors.green(`Post: [${postToEdit.title}] updated successfully!`)
  );
  separate();
};

const deletePost = async () => {
  const postToDelete = await getPost();

  if (!postToDelete) {
    console.log(colors.red("Post not found!"));
    return;
  }

  separate();
  const confirmDelete = await confirm({
    message: "Are you sure you want to delete this post?",
    default: false,
  });

  if (!confirmDelete) {
    console.log(colors.yellow("Post deletion aborted!"));
    return;
  }

  console.log(colors.italic(`Deleting post: [${postToDelete.title}}]...`));
  posts = posts.filter((post) => post.id !== postToDelete.id);
  commitPostToFile();

  console.log(colors.green(`Post deleted successfully!`));
  separate();
};

const getMenuAction = async () => {
  separate();
  const answer = await select({
    message: "Pick one operation from below:",
    choices: [
      {
        name: "Create post",
        value: "create",
        short: "[Creation mode]",
        description: "Create a new post",
      },
      {
        name: "View post",
        value: "view",
        short: "[View mode]",
        description: "View the content of an existing post",
      },
      {
        name: "Edit post",
        value: "edit",
        short: "[Edit mode]",
        description: "Edit the content of an existing post",
      },
      {
        name: "Delete post",
        value: "delete",
        short: colors.redBright("[Delete mode]"),
        description: "Delete an existing post (permanently)",
      },
      {
        name: "Exit",
        value: "exit",
        description: "Exit application",
      },
      new Separator(),
    ],
  });
  separate();
  return answer;
};

const getPost = async () => {
  if (posts.length === 0) {
    // Prompt the user with other options
    const noPostAnswer = await select({
      message: colors.yellow("You have no post!"),
      choices: [
        { name: "Create one now", value: "create" },
        { name: "Back to menu", value: "menu" },
        { name: "Exit", value: "exit" },
      ],
    });

    if (noPostAnswer === "create") await createPost();
    else if (noPostAnswer === "menu") await main();
    else if (noPostAnswer === "exit") throw new Error("exit");
    return;
  }

  if (posts.length === 1) {
    console.log(
      `You only have one post. ${colors.italic(
        "proceeding with post"
      )}:${colors.cyan(`[${posts[0].title}]`)} `
    );
    await delay(2000);

    return posts[0];
  }

  const choicePosts = posts.map((post) => ({
    value: post,
    name: post.title,
    description: post.content.slice(0, 45) + "...",
    short: `[${post.title}] selected`,
    ...post,
  }));

  separate();
  const selectedPost = await search({
    message: "Select/Search for a post:",
    source: async (query) => {
      if (!query) return choicePosts;

      return choicePosts.filter(
        (post) =>
          post.title.toLowerCase().includes(query.toLowerCase()) ||
          post.content.toLowerCase().includes(query.toLowerCase())
      );
    },
  });
  separate();
  return selectedPost;
};

const actions = {
  create: createPost,
  view: viewPost,
  edit: editPost,
  delete: deletePost,
};

const main = async (defaultAction) => {
  const action = defaultAction ?? (await getMenuAction());

  if (action === "exit") return;

  await actions[action]();

  separate();
  const nextAction = await select({
    message: "What would you like to do next?",
    choices: [
      {
        name: `${action[0].toUpperCase() + action.slice(1)} post`,
        value: action,
      },
      { name: "Back to menu", value: "menu" },
      { name: "Exit", value: "exit" },
    ],
  });
  separate();

  if (nextAction === action) await main(nextAction);
  else if (nextAction === "menu") await main();
  else if (nextAction === "exit") throw new Error("exit");
};

// ----------The above functions and variables contains useful functions that control the cli--

// Initialize the cli
await readPostsFromFile();
const heading = `
  ___ _            _       ___ _              ___ _    ___ 
 / __(_)_ __  _ __| |___  | _ ) |___  __ _   / __| |  |_ _|
 \\__ \\ | '  \\| '_ \\ / -_) | _ \\ / _ \\/ _\` | | (__| |__ | | 
 |___/_|_|_|_| .__/_\\___| |___/_\\___/\\__, |  \\___|____|___|
             |_|                     |___/                 

                          Let's get cooking!`;

const randColors = [
  colors.black,
  colors.red,
  colors.green,
  colors.yellow,
  colors.blue,
  colors.magenta,
  colors.cyan,
  colors.white,
  colors.gray,
  colors.redBright,
  colors.greenBright,
  colors.yellowBright,
  colors.blueBright,
  colors.magentaBright,
  colors.cyanBright,
  colors.whiteBright,
];

const transformedHeading = heading
  .split("")
  .map((char) => {
    const randomColor =
      randColors[Math.floor(Math.random() * randColors.length)];
    return randomColor(char);
  })
  .join("");
console.log(colors.bold(transformedHeading));

// Start the main cli loop
try {
  await main();
} catch {
} finally {
  separate();
  console.log(colors.redBright("❌ Exiting..."));
  separate();
  process.exit();
}
