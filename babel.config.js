module.exports = (api) => {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }], "nativewind/babel"],
    plugins: [
      // Lets drizzle migrations (`.sql`) be imported as strings.
      ["inline-import", { extensions: [".sql"] }],
    ],
  };
};
