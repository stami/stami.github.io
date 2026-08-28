const path = require("path");
const eleventyImage = require("@11ty/eleventy-img").default;
const { DateTime } = require("luxon");

module.exports = (eleventyConfig) => {
  function escapeHtml(value) {
  return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function relativeToInputPath(inputPath, relativeFilePath) {
    let split = inputPath.split("/");
    split.pop();

    return path.resolve(split.join(path.sep), relativeFilePath);
  }

  // Eleventy Image shortcode
  // https://www.11ty.dev/docs/plugins/image/
  eleventyConfig.addAsyncShortcode(
    "image",
    async function imageShortcode(src, alt, widths, sizes) {
      // Full list of formats here: https://www.11ty.dev/docs/plugins/image/#output-formats
      // Warning: Avif can be resource-intensive so take care!
      let formats = ["auto"];
      let file = relativeToInputPath(this.page.inputPath, src);
      let metadata = await eleventyImage(file, {
        widths: widths || ["auto"],
        formats,
        outputDir: path.join(eleventyConfig.dir.output, "img"), // Advanced usage note: `eleventyConfig.dir` works here because we’re using addPlugin.
      });

      // TODO loading=eager and fetchpriority=high
      let imageAttributes = {
        alt,
        sizes,
        loading: "lazy",
        decoding: "async",
      };
      return eleventyImage.generateHTML(metadata, imageAttributes);
    }
  );

  async function galleryImageShortcode(src, alt, caption, inputPath) {
    let file = relativeToInputPath(inputPath || this.page.inputPath, src);
    let metadata = await eleventyImage(file, {
      widths: [320, 640, 960, 1600, "auto"],
      formats: ["avif", "webp", "auto"],
      outputDir: path.join(eleventyConfig.dir.output, "img"),
    });
    let originalFormat = path.extname(file).slice(1).toLowerCase();
    let originals = metadata[originalFormat] || Object.values(metadata).at(-1);
    let fullImage = originals.at(-1);
    let imageHtml = eleventyImage.generateHTML(metadata, {
      alt: alt || "",
      sizes: "(min-width: 768px) 384px, 50vw",
      loading: "lazy",
      decoding: "async",
    });

    return `<a href="${fullImage.url}" data-pswp-width="${fullImage.width}" data-pswp-height="${fullImage.height}" target="_blank"${caption ? ` data-pswp-caption="${escapeHtml(caption)}"` : ""}>${imageHtml}</a>`;
  }

  eleventyConfig.addAsyncShortcode("galleryImage", galleryImageShortcode);

  eleventyConfig.addAsyncShortcode(
    "expandedPhotoPosts",
    async function expandedPhotoPostsShortcode(collection, limit) {
      let posts = Array.from(collection);
      if (limit) {
        posts = posts.slice(-limit);
      }
      posts.reverse();
      let articles = [];

      for (let post of posts) {
        let figures = await Promise.all(
          post.data.photos.map(async (photo) => {
            let image = await galleryImageShortcode.call(
              this,
              photo.image,
              photo.alt,
              photo.caption,
              post.inputPath,
            );
            let caption = photo.caption
              ? `<figcaption class="mt-1 text-sm">${escapeHtml(photo.caption)}</figcaption>`
              : "";
            return `<figure class="mb-2 break-inside-avoid">${image}${caption}</figure>`;
          }),
        );

        let postDate = DateTime.fromJSDate(post.date, { zone: "utc" });
        articles.push(`<article class="mb-12">
  <h2 class="mb-2"><a href="${post.url}">${escapeHtml(post.data.title)}</a></h2>
  <time class="block text-slate-500 dark:text-slate-400" datetime="${postDate.toFormat("yyyy-LL-dd")}">${postDate.toFormat("d LLLL yyyy")}</time>
  ${post.templateContent}
  <div class="photo-gallery mt-6 columns-2 gap-2">
    ${figures.join("\n    ")}
  </div>
</article>`);
      }

      return articles.join("\n");
    },
  );
};
