(function () {
  "use strict";

  var bodyClasses =
    "font-sans font-normal leading-relaxed font-base bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200";
  var mainClasses = "container max-w-screen-md mx-auto p-5";

  function prepareDocument(component, basePath) {
    var document = component.props.document;
    var base = document.head.querySelector("base[data-oaken-preview]");

    if (!base) {
      base = document.createElement("base");
      base.setAttribute("data-oaken-preview", "");
      document.head.prepend(base);
    }

    base.href =
      typeof basePath === "function"
        ? basePath(component.props.entry)
        : basePath;
    document.documentElement.lang = "en";
    document.body.className = bodyClasses;
  }

  function restoreMarkdownImages(component) {
    var body = component.props.entry.getIn(["data", "body"]) || "";
    var sourcesByAlt = {};
    var imagePattern = /!\[([^\]]*)\]\(([^\s)]+)(?:\s+["'][^"']*["'])?\)/g;
    var match;

    while ((match = imagePattern.exec(body))) {
      (sourcesByAlt[match[1]] || (sourcesByAlt[match[1]] = [])).push(match[2]);
    }

    component.props.document.querySelectorAll("img:not([src])").forEach(
      function (image) {
        var sources = sourcesByAlt[image.alt];

        if (sources && sources.length) {
          image.src = sources.shift();
        }
      },
    );
  }

  function createPagePreview(basePath) {
    return createClass({
      componentDidMount: function () {
        restoreMarkdownImages(this);
      },
      componentDidUpdate: function () {
        restoreMarkdownImages(this);
      },
      render: function () {
        prepareDocument(this, basePath);
        return h(
          "main",
          { className: mainClasses },
          this.props.widgetFor("body"),
        );
      },
    });
  }

  function blogBasePath(entry) {
    var parts = (entry.get("slug") || "").split("/").filter(Boolean);
    var lastIndex = parts.length - 1;

    if (lastIndex > 0 && parts[lastIndex] === parts[lastIndex - 1]) {
      parts.pop();
    }

    return "/blog/" + parts.join("/") + "/";
  }

  var BlogPreview = createClass({
    componentDidMount: function () {
      restoreMarkdownImages(this);
    },
    componentDidUpdate: function () {
      restoreMarkdownImages(this);
    },
    render: function () {
      prepareDocument(this, blogBasePath);

      var entry = this.props.entry;
      var tags = entry.getIn(["data", "tags"]);
      var tagElements = tags
        ? tags
            .map(function (tag) {
              return h(
                "span",
                {
                  className:
                    "relative grid select-none items-center whitespace-nowrap rounded-lg bg-slate-100 py-1 px-2 font-sans text-xs font-bold text-slate-600",
                  key: tag,
                },
                tag,
              );
            })
            .toArray()
        : [];

      return h(
        "main",
        { className: mainClasses },
        h("h1", { className: "mb-2" }, entry.getIn(["data", "title"])),
        h(
          "div",
          { className: "flex flex-row items-center gap-2" },
          h("time", {}, entry.getIn(["data", "date"])),
          tagElements,
        ),
        this.props.widgetFor("body"),
      );
    },
  });

  CMS.registerPreviewStyle("/admin/preview-base.css");
  CMS.registerPreviewStyle("/admin/preview-tailwind.css");
  CMS.registerPreviewStyle("/admin/preview-code.css");

  CMS.registerPreviewTemplate("blog", BlogPreview);
  CMS.registerPreviewTemplate("about", createPagePreview("/about/"));
  CMS.registerPreviewTemplate("privacy", createPagePreview("/privacy/"));
  CMS.registerPreviewTemplate("not_found", createPagePreview("/"));
  CMS.registerPreviewTemplate(
    "glucose_graph",
    createPagePreview("/apps/glucosegraph/"),
  );
  CMS.registerPreviewTemplate("van", createPagePreview("/diy/van/"));
})();
