// Retired archive-import command.
//
// The published library now combines reviewed source documents, durable
// post-review corrections, and repo-native live-event printables/addenda. The
// former importer rebuilt only the archive-backed subset and deleted
// public/files first, which could erase valid current material. Use the targeted
// tools/docgen render/build/publish_one workflow and stamp_file_sizes.mjs.

throw new Error(
  "tools/gen_files.mjs is retired because it cannot reproduce the current 108-document library. Use targeted docgen commands and tools/stamp_file_sizes.mjs.",
);
