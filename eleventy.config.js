const { DateTime } = require("luxon");
const markdownItAnchor = require("markdown-it-anchor");

const pluginRss = require("@11ty/eleventy-plugin-rss").default;
const pluginSyntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const pluginBundle = require("@11ty/eleventy-plugin-bundle").default;
const pluginNavigation = require("@11ty/eleventy-navigation");
const { EleventyHtmlBasePlugin } = require("@11ty/eleventy");

const pluginDrafts = require("./eleventy.config.drafts.js");
const pluginImages = require("./eleventy.config.images.js");

module.exports = function (eleventyConfig) {
  const generatedCssPath =
    process.env.ELEVENTY_GENERATED_CSS || "./public/css/generated.css";

  eleventyConfig.addPassthroughCopy({
    "./public/admin/": "/admin/",
    [generatedCssPath]: "/admin/preview-tailwind.css",
    "./public/css/index.css": "/admin/preview-base.css",
    "./node_modules/photoswipe/dist/photoswipe.esm.js":
      "/vendor/photoswipe/photoswipe.esm.js",
    "./node_modules/photoswipe/dist/photoswipe-lightbox.esm.js":
      "/vendor/photoswipe/photoswipe-lightbox.esm.js",
    "./node_modules/prism-themes/themes/prism-one-dark.css":
      "/admin/preview-code.css",
    "./public/img/": "/img/",
    "./public/downloads/": "/downloads/",
    "./public/lasku-fraktuura/": "/lasku-fraktuura/",
    "./public/misc/": "/misc/",
  });

  // Run Eleventy when these files change:
  eleventyConfig.addWatchTarget(generatedCssPath);

  // Watch content images for the image pipeline.
  eleventyConfig.addWatchTarget("content/**/*.{svg,webp,png,jpg,jpeg,gif}");
  eleventyConfig.addPassthroughCopy("content/**/*.{svg,webp,png,jpg,jpeg,gif}");

  // App plugins
  eleventyConfig.addPlugin(pluginDrafts);
  eleventyConfig.addPlugin(pluginImages);

  // Official plugins
  eleventyConfig.addPlugin(pluginRss);
  eleventyConfig.addPlugin(pluginSyntaxHighlight, {
    preAttributes: { tabindex: 0 },
  });
  eleventyConfig.addPlugin(pluginNavigation);
  eleventyConfig.addPlugin(EleventyHtmlBasePlugin);
  eleventyConfig.addPlugin(pluginBundle);

  eleventyConfig.addCollection("archive", (collectionApi) => {
    return [
      ...collectionApi.getFilteredByTag("posts"),
      ...collectionApi.getFilteredByTag("photos"),
    ].sort((first, second) => first.date - second.date);
  });

  // Filters
  eleventyConfig.addFilter("readableDate", (dateObj, format, zone) => {
    // Formatting tokens for Luxon: https://moment.github.io/luxon/#/formatting?id=table-of-tokens
    return DateTime.fromJSDate(dateObj, { zone: zone || "utc" }).toFormat(
      format || "d LLLL yyyy",
    );
  });

  eleventyConfig.addFilter("htmlDateString", (dateObj) => {
    // dateObj input: https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#valid-date-string
    return DateTime.fromJSDate(dateObj, { zone: "utc" }).toFormat("yyyy-LL-dd");
  });

  // Get the first `n` elements of a collection.
  eleventyConfig.addFilter("head", (array, n) => {
    if (!Array.isArray(array) || array.length === 0) {
      return [];
    }
    if (n < 0) {
      return array.slice(n);
    }

    return array.slice(0, n);
  });

  // Return the smallest number argument
  eleventyConfig.addFilter("min", (...numbers) => {
    return Math.min.apply(null, numbers);
  });

  // Return all the tags used in a collection
  eleventyConfig.addFilter("getAllTags", (collection) => {
    let tagSet = new Set();
    for (let item of collection) {
      (item.data.tags || []).forEach((tag) => tagSet.add(tag));
    }
    return Array.from(tagSet);
  });

  eleventyConfig.addFilter("filterTagList", function filterTagList(tags) {
    return (tags || []).filter(
      (tag) =>
        ["all", "archive", "nav", "photos", "post", "posts", "species"].indexOf(
          tag,
        ) === -1,
    );
  });

  eleventyConfig.addFilter("speciesPhotos", (collection, species) => {
    return collection.flatMap((post) =>
      (post.data.photos || [])
        .filter((photo) => (photo.species || []).includes(species))
        .map((photo) => ({
          ...photo,
          inputPath: post.inputPath,
          postDate: post.date,
          postTitle: post.data.title,
          postUrl: post.url,
        })),
    );
  });

    eleventyConfig.addFilter("photoAlbumCount", (photos) => {
      return new Set(photos.map((photo) => photo.postUrl)).size;
    });

  return {
    // Control which files Eleventy will process
    // e.g.: *.md, *.njk, *.html, *.liquid
    templateFormats: ["md", "njk", "html", "liquid"],

    // Pre-process *.md files with: (default: `liquid`)
    markdownTemplateEngine: "njk",

    // Pre-process *.html files with: (default: `liquid`)
    htmlTemplateEngine: "njk",

    // These are all optional:
    dir: {
      input: "content", // default: "."
      includes: "../_includes", // default: "_includes"
      data: "../_data", // default: "_data"
      output: "_site",
    },

    // -----------------------------------------------------------------
    // Optional items:
    // -----------------------------------------------------------------

    // If your site deploys to a subdirectory, change `pathPrefix`.
    // Read more: https://www.11ty.dev/docs/config/#deploy-to-a-subdirectory-with-a-path-prefix

    // When paired with the HTML <base> plugin https://www.11ty.dev/docs/plugins/html-base/
    // it will transform any absolute URLs in your HTML to include this
    // folder name and does **not** affect where things go in the output folder.
    pathPrefix: "/",
  };
};
