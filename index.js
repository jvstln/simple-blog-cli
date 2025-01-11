import fs from "node:fs/promises";
import colors from "yoctocolors-cjs";
import { input, select, search, confirm, Separator } from "@inquirer/prompts";

/* This will contain and manage posts
Post format: { id, title, date, content, author } */
let posts = [];
const separate = () => console.log(new Separator().separator.repeat(3));
const delay = async (milliseconds = 1000) =>
  new Promise((res) => setTimeout(res, milliseconds));

const commitPostToFile = async () => {
  await fs.writeFile(
    "./posts.json",
    JSON.stringify(posts, (key, value) =>
      key === "date" ? new Date(value).toLocaleString() : value
    )
  );
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

const initializeApp = async () => {
  await readPostsFromFile();

  const heading = `Let's get cooking!\n`;
  console.log(colors.bold(heading));
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

  console.log(colors.italic(`Viewing post: [id=${post.id}]...`));
  await delay();
  separate();
  console.log(`${colors.green("Post title:")} ${post.title}`);
  console.log(
    `${colors.green("Date:")} ${post.date ?? colors.italic("Unknown")}`
  );
  console.log(`\n${colors.green("Content:")} ${post.content}`);
  console.log(`${post.author ? colors.green("Author: ") + post.author : ""}`);
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
    ...newPost,
    date: new Date(),
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
    !Object.keys(postToEdit).every((key) => editedPost[key] === postToEdit[key])
  ) {
    editedPost.date = new Date();
  }

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
    message: "Select an action:",
    choices: [
      {
        name: "Create post",
        value: "create",
        short: "[Creation mode]",
        description: "Create a new post",
      },
      {
        name: "View post",
        value: "read",
        short: "[View mode]",
        description: "View the content of an existing post",
      },
      {
        name: "Edit post",
        value: "update",
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
    ],
  });
  separate();
  return answer;
};

const getPost = async () => {
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
  read: viewPost,
  update: editPost,
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
        name: `${action[0].toUpperCase() + action.slice(1)} another post`,
        value: action,
      },
      { name: "Back to menu", value: "menu" },
      { name: "Exit", value: "exit" },
    ],
  });
  separate();

  if (nextAction === action) await main(nextAction);
  else if (nextAction === "menu") await main();
};

await initializeApp();

try {
  await main();
  separate();
  console.log(colors.redBright("❌ Exiting..."));
  separate();
} catch {
  separate();
  console.log(colors.redBright("❌ Exiting..."));
  separate();
}
