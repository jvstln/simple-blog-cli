import colors from "yoctocolors-cjs";
import { input } from "@inquirer/prompts";

/* This will contain and manage posts
Post format: { id, title, date, content, author } */
let posts = [];

const viewPost = (id) => {
  const post = posts.find((post) => post.id === id);

  if (!post) {
    console.log(colors.red("Post not found!"));
    return;
  }

  console.log(colors.italic(`Viewing post: [id=${post.id}]...`));
  console.log(`${colors.green("Post title:")} ${post.title}`);
  console.log(
    `${colors.green("Date:")} ${post.date ?? colors.italic("Unknown")}`
  );
  console.log(`\n${colors.green("Content:")} ${post.content}`);
  console.log(`${post.author ? colors.green("Author: ") + post.author : ""}`);
};

const createPost = async () => {
  const title = await input({
    message: "Enter post title:",
    default: "Untitled post",
  });

  const content = await input({
    message: "Enter post content:",
    validate: (content) => content.length > 0 || "Content cannot be empty",
  });

  const author = await input({
    message: "Enter post author:",
    default: "None",
  });

  console.log(colors.italic("Creating post..."));

  const newPost = {
    id: Math.random().toString().slice(2),
    date: new Date(),
    title,
    content,
    author: author === "None" ? undefined : author,
  };
  posts.push(newPost);

  console.log(colors.green(`Post: [${title}] created successfully!`));
  return newPost.id;
};

const deletePost = async (id) => {
  console.log(
    colors.italic(
      `Deleting post: [${posts.find((post) => post.id === id).title}}]...`
    )
  );
  posts = posts.filter((post) => post.id !== id);
  console.log(colors.green(`Post deleted successfully!`));
};
