import * as mume from "@shd101wyy/mume";
import {CompositeDisposable, TextEditor, Directory, File} from "atom";
import * as path from "path";
import {ShowdeoSimplePreviewConfig} from "./config";
import {ShowdeoSimplePreviewView} from "./preview-content-provider";
import * as fs from 'fs';

const utility = mume.utility;
const showdeoBaseUrl = 'https://simple.showdeo.com/';

let subscriptions: CompositeDisposable = null;
let config: ShowdeoSimplePreviewConfig = null;

/**
 * Key is editor.getPath()
 * Value is ShowdeoSimplePreviewView object
 */
let previewsMap: { [key: string]: ShowdeoSimplePreviewView } = {};

/**
 * Check if the `filePath` is a markdown file.
 * @param filePath
 */
function isMarkdownFile(filePath: string = ""): boolean {
    if (filePath.startsWith("mpe://")) {
        return false;
    } // this is preview

    const ext = path.extname(filePath);
    for (let i = 0; i < config.fileExtension.length; i++) {
        if (config.fileExtension[i] === ext) {
            return true;
        }
    }
    return false;
}

/**
 * This function will be called when `config` is changed.
 * @param config
 */
function onDidChangeConfig(): void {
    for (const sourceUri in previewsMap) {
        if (previewsMap.hasOwnProperty(sourceUri)) {
            const preview = previewsMap[sourceUri];
            preview.updateConfiguration();
            preview.loadPreview();
        }
    }
}

/**
 * As the function name pointed...
 */
function getSinglePreview() {
    return previewsMap[Object.keys(previewsMap)[0]];
}

/**
 * Return the preview object for editor(editorFilePath).
 * @param editor
 */
function getPreviewForEditor(editor) {
    if (config.singlePreview) {
        return getSinglePreview();
    } else if (typeof editor === "string") {
        return previewsMap[editor];
    } else if (editor instanceof ShowdeoSimplePreviewView) {
        return editor;
    } else if (editor && editor.getPath) {
        return previewsMap[editor.getPath()];
    } else {
        return null;
    }
}

/**
 * Toggle markdown preview
 */
function togglePreview() {
    console.log('toggle preview called')
    const editor = atom.workspace.getActivePaneItem();
    const preview = getPreviewForEditor(editor);

    if (preview && preview["getEditor"] && preview["getEditor"]()) {
        // preview is already on, so remove it.
        const pane = atom.workspace.paneForItem(preview);
        pane.destroyItem(preview); // this will trigger preview.destroy()
        removePreviewFromMap(preview);
    } else {
        startPreview(editor);
    }
}

/**
 * Remove preview from `previewsMap`
 * @param preview
 */
function removePreviewFromMap(preview: ShowdeoSimplePreviewView) {
    for (const key in previewsMap) {
        if (previewsMap[key] === preview) {
            delete previewsMap[key];
        }
    }
}

/**
 * Start preview for editor
 * @param editor
 */
function startPreview(editor) {
    if (!editor || !editor["getPath"] || !isMarkdownFile(editor.getPath())) {
        return;
    }

    let preview = getPreviewForEditor(editor);

    if (!preview) {
        if (config.singlePreview) {
            preview = new ShowdeoSimplePreviewView("mpe://single_preview", config);
            previewsMap["single_preview"] = preview;
        } else {
            preview = new ShowdeoSimplePreviewView(
                "mpe://" + editor.getPath(),
                config,
            );
            previewsMap[editor.getPath()] = preview;
        }
        preview.onPreviewDidDestroy(removePreviewFromMap);
    }

    if (preview.getEditor() !== editor) {
        preview.bindEditor(editor);
    }
}

export function activate(state) {
    mume
        .init() // init mume package
        .then(() => {
            subscriptions = new CompositeDisposable();

            // Init config
            config = new ShowdeoSimplePreviewConfig();
            config.onDidChange(subscriptions, onDidChangeConfig);
            mume.onDidChangeConfigFile(onDidChangeConfig);

            // Set opener
            subscriptions.add(
                atom.workspace.addOpener((uri) => {
                    if (uri.startsWith("mpe://")) {
                        if (config.singlePreview) {
                            return getSinglePreview();
                        } else {
                            return previewsMap[uri.replace("mpe://", "")];
                        }
                    }
                }),
            );

            // Register commands
            subscriptions.add(
                atom.commands.add("atom-workspace", {
                    "showdeo-simple-preview:toggle": togglePreview,
                    "showdeo-simple-preview:customize-css": customizeCSS,
                    "showdeo-simple-preview:create-toc": createTOC,
                    "showdeo-simple-preview:toggle-scroll-sync": toggleScrollSync,
                    "showdeo-simple-preview:toggle-live-update": toggleLiveUpdate,
                    "showdeo-simple-preview:toggle-break-on-single-newline": toggleBreakOnSingleNewLine,
                    "showdeo-simple-preview:insert-table": insertTable,
                    "showdeo-simple-preview:image-helper": startImageHelper,
                    "showdeo-simple-preview:open-mermaid-config": openMermaidConfig,
                    "showdeo-simple-preview:open-mathjax-config": openMathJaxConfig,
                    "showdeo-simple-preview:open-katex-config": openKaTeXConfig,
                    "showdeo-simple-preview:extend-parser": extendParser,
                    "showdeo-simple-preview:insert-new-slide": insertNewSlide,
                    "showdeo-simple-preview:insert-page-break": insertPageBreak,
                    "showdeo-simple-preview:toggle-zen-mode": toggleZenMode,
                    "showdeo-simple-preview:run-code-chunk": runCodeChunkCommand,
                    "showdeo-simple-preview:run-all-code-chunks": runAllCodeChunks,
                    "showdeo-simple-preview:show-uploaded-images": showUploadedImages,
                    "showdeo-simple-preview:sync-server-upload": syncServerUpload,
                }),
            );

            // When the preview is displayed
            // preview will display the content of editor (pane item) that is activated
            subscriptions.add(
                atom.workspace.onDidStopChangingActivePaneItem((editor: TextEditor) => {
                    if (
                        editor &&
                        editor["buffer"] &&
                        editor["getPath"] &&
                        isMarkdownFile(editor["getPath"]())
                    ) {
                        const preview = getPreviewForEditor(editor);
                        if (!preview) {
                            return;
                        }

                        if (
                            config.singlePreview &&
                            preview.getEditor() !== editor &&
                            atom.workspace.paneForItem(preview) !==
                            atom.workspace.paneForItem(editor)
                        ) {
                            // This line fixed issue #692
                            preview.bindEditor(editor as TextEditor);
                        }

                        if (config.automaticallyShowPreviewOfMarkdownBeingEdited) {
                            const pane = atom.workspace.paneForItem(preview);
                            if (pane && pane !== atom.workspace.getActivePane()) {
                                pane.activateItem(preview);
                            }
                        }
                    }
                }),
            );

            // automatically open preview when activate a markdown file
            // if 'openPreviewPaneAutomatically' option is enabled.
            subscriptions.add(
                atom.workspace.onDidOpen((event) => {
                    if (config.openPreviewPaneAutomatically) {
                        if (
                            event.uri &&
                            event.item &&
                            isMarkdownFile(event.uri) &&
                            !event.uri.startsWith("mpe://")
                        ) {
                            const pane = event.pane;
                            const panes = atom.workspace.getPanes();

                            // if the markdown file is opened on the right pane, then move it to the left pane. Issue #25
                            if (pane !== panes[0]) {
                                pane.moveItemToPane(event.item, panes[0], 0); // move md to left pane.
                            }
                            panes[0]["setActiveItem"](event.item);
                            panes[0].activate();

                            const editor = event.item;
                            startPreview(editor);
                        }
                    }

                    // check zen mode
                    if (event.uri && event.item && isMarkdownFile(event.uri)) {
                        const editor = event.item;
                        const editorElement = editor["getElement"]();
                        if (editor && editor["buffer"]) {
                            if (atom.config.get("showdeo-simple-preview.enableZenMode")) {
                                editorElement.setAttribute("data-markdown-zen", "");
                            } else {
                                editorElement.removeAttribute("data-markdown-zen");
                            }
                        }

                        // drop drop image events
                        bindMarkdownEditorDropEvents(editor);
                    }
                }),
            );

            // zen mode observation
            subscriptions.add(
                atom.config.observe(
                    "showdeo-simple-preview.enableZenMode",
                    (enableZenMode) => {
                        const paneItems = atom.workspace.getPaneItems();
                        for (let i = 0; i < paneItems.length; i++) {
                            const editor = paneItems[i];
                            if (
                                editor &&
                                editor["getPath"] &&
                                isMarkdownFile(editor["getPath"]())
                            ) {
                                if (editor["buffer"]) {
                                    const editorElement = editor["getElement"]();
                                    if (enableZenMode) {
                                        editorElement.setAttribute("data-markdown-zen", "");
                                    } else {
                                        editorElement.removeAttribute("data-markdown-zen");
                                    }
                                }

                                // drop drop image events
                                bindMarkdownEditorDropEvents(editor);
                            }
                        }

                        if (enableZenMode) {
                            document
                                .getElementsByTagName("atom-workspace")[0]
                                .setAttribute("data-markdown-zen", "");
                        } else {
                            document
                                .getElementsByTagName("atom-workspace")[0]
                                .removeAttribute("data-markdown-zen");
                        }
                    },
                ),
            );

            // use single preview
            subscriptions.add(
                atom.config.onDidChange(
                    "showdeo-simple-preview.singlePreview",
                    (singlePreview) => {
                        for (const sourceUri in previewsMap) {
                            if (previewsMap.hasOwnProperty(sourceUri)) {
                                const preview = previewsMap[sourceUri];
                                const pane = atom.workspace.paneForItem(preview);
                                pane.destroyItem(preview); // this will trigger preview.destroy()
                            }
                        }
                        previewsMap = {};
                    },
                ),
            );

            // Check package version
            const packageVersion = require(path.resolve(
                __dirname,
                "../../package.json",
            ))["version"];
            if (packageVersion !== mume.configs.config["atom_mpe_version"]) {
                mume.utility.updateExtensionConfig({
                    atom_mpe_version: packageVersion,
                });

                // Don't open `welcome.md` file anymore.
                // atom.workspace.open(path.resolve(__dirname, '../../docs/welcome.md'))
            }
        });
}

/**
 * Drop image file to markdown editor and upload the file directly.
 * @param editor
 */
function bindMarkdownEditorDropEvents(editor) {
    if (editor && editor.getElement) {
        const editorElement = editor.getElement();

        function dropImageFile(event) {
            const files = event.dataTransfer.files;
            for (let i = 0; i < files.length; i++) {
                const imageFilePath = files[i].path;
                if (files[i].type.startsWith("image")) {
                    // Drop image
                    const imageDropAction = atom.config.get(
                        "showdeo-simple-preview.imageDropAction",
                    );
                    if (imageDropAction === "upload") {
                        // upload image
                        event.stopPropagation();
                        event.preventDefault();
                        ShowdeoSimplePreviewView.uploadImageFile(
                            editor,
                            imageFilePath,
                            config.imageUploader,
                        );
                    } else if (imageDropAction.startsWith("insert")) {
                        // insert relative path
                        event.stopPropagation();
                        event.preventDefault();
                        const editorPath = editor.getPath();
                        const description = path
                            .basename(imageFilePath)
                            .replace(path.extname(imageFilePath), "");
                        editor.insertText(
                            `![${description}](${path.relative(
                                path.dirname(editorPath),
                                imageFilePath,
                            )})`,
                        );
                    } else if (imageDropAction.startsWith("copy")) {
                        // copy to image folder
                        event.stopPropagation();
                        event.preventDefault();
                        ShowdeoSimplePreviewView.pasteImageFile(
                            editor,
                            atom.config.get("showdeo-simple-preview.imageFolderPath"),
                            imageFilePath,
                        );
                    }
                }
            }
            return false;
        }

        editorElement.ondrop = dropImageFile;
        editorElement.ondragover = (event) => {
            event.preventDefault();
            event.stopPropagation();
            return false;
        };
    }
}

/**
 * Open ~/.mume/style.less
 */
function customizeCSS() {
    const globalStyleLessFile = path.resolve(
        utility.extensionConfigDirectoryPath,
        "./style.less",
    );
    atom.workspace.open(globalStyleLessFile);
}

function createTOC() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor && editor.getBuffer()) {
        editor.insertText(
            '\n<!-- @import "[TOC]" {cmd="toc" depthFrom=1 depthTo=6 orderedList=false} -->\n',
        );
    }
}

function toggleScrollSync() {
    const flag = atom.config.get("showdeo-simple-preview.scrollSync");
    atom.config.set("showdeo-simple-preview.scrollSync", !flag);

    if (!flag) {
        atom.notifications.addInfo("Scroll Sync enabled");
    } else {
        atom.notifications.addInfo("Scroll Sync disabled");
    }
}

function toggleLiveUpdate() {
    const flag = atom.config.get("showdeo-simple-preview.liveUpdate");
    atom.config.set("showdeo-simple-preview.liveUpdate", !flag);

    if (!flag) {
        atom.notifications.addInfo("Live Update enabled");
    } else {
        atom.notifications.addInfo("Live Update disabled");
    }
}

function toggleBreakOnSingleNewLine() {
    const flag = atom.config.get(
        "showdeo-simple-preview.breakOnSingleNewLine",
    );
    atom.config.set("showdeo-simple-preview.breakOnSingleNewLine", !flag);

    if (!flag) {
        atom.notifications.addInfo("Enabled breaking on single newline");
    } else {
        atom.notifications.addInfo("Disabled breaking on single newline");
    }
}

function insertTable() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor && editor.getBuffer()) {
        editor.insertText(`|   |   |
|---|---|
|   |   |
`);
    }
}

function startImageHelper() {
    const editor = atom.workspace.getActiveTextEditor();
    const preview = getPreviewForEditor(editor);
    if (!preview) {
        atom.notifications.addError("Please open preview first.");
    } else {
        preview.startImageHelper();
    }
}

function openMermaidConfig() {
    const mermaidConfigFilePath = path.resolve(
        utility.extensionConfigDirectoryPath,
        "./mermaid_config.js",
    );
    atom.workspace.open(mermaidConfigFilePath);
}

function openMathJaxConfig() {
    const mathjaxConfigFilePath = path.resolve(
        utility.extensionConfigDirectoryPath,
        "./mathjax_config.js",
    );
    atom.workspace.open(mathjaxConfigFilePath);
}

function openKaTeXConfig() {
    const katexConfigFilePath = path.resolve(
        utility.extensionConfigDirectoryPath,
        "./katex_config.js",
    );
    atom.workspace.open(katexConfigFilePath);
}

function extendParser() {
    const parserConfigPath = path.resolve(
        utility.extensionConfigDirectoryPath,
        "./parser.js",
    );
    atom.workspace.open(parserConfigPath);
}

function insertNewSlide() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor && editor.getBuffer()) {
        editor.insertText("<!-- slide -->\n");
    }
}

function insertPageBreak() {
    const editor = atom.workspace.getActiveTextEditor();
    if (editor && editor.getBuffer()) {
        editor.insertText("<!-- pagebreak -->\n");
    }
}

function toggleZenMode() {
    const enableZenMode = atom.config.get(
        "showdeo-simple-preview.enableZenMode",
    );
    atom.config.set("showdeo-simple-preview.enableZenMode", !enableZenMode);
    if (!enableZenMode) {
        atom.notifications.addInfo("zen mode enabled");
    } else {
        atom.notifications.addInfo("zen mode disabled");
    }
}

function runCodeChunkCommand() {
    const editor = atom.workspace.getActiveTextEditor();
    const preview = getPreviewForEditor(editor);
    if (!preview) {
        atom.notifications.addError("Please open preview first.");
    } else {
        preview.sendRunCodeChunkCommand();
    }
}

function runAllCodeChunks() {
    const editor = atom.workspace.getActiveTextEditor();
    const preview = getPreviewForEditor(editor);
    if (!preview) {
        atom.notifications.addError("Please open preview first.");
    } else {
        preview.runAllCodeChunks();
    }
}

function showUploadedImages() {
    const imageHistoryFilePath = path.resolve(
        utility.extensionConfigDirectoryPath,
        "./image_history.md",
    );
    atom.workspace.open(imageHistoryFilePath);
}

function syncServerUpload() {
    const projectHome = atom.config.get("core.projectHome");
    console.log('project home', projectHome);

    const pane = atom.workspace.getActivePane();
    const activeItem = pane.getActiveItem();

    if (atom.workspace.isTextEditor(pane)) {
        const filePath = editor.getPath();
        uploadFileToServer(filePath);
    } else {

        if (activeItem instanceof Directory) {
            // TODO: iterate recursively sending files

        } else if (activeItem instanceof File) {
            uploadFileToServer((activeItem as File).getPath());
        }

    }
}

function uploadFileToServer(filePath) {

    const relativePath = atom.project.relativize(filePath);

    console.log('upload file path', filePath);
    console.log('relative file path', relativePath);

    const file = new Blob()

    console.log('upload file', file);

    // Add the blob to the form
    let uploadForm = document.getElementById("uploadForm") as HTMLFormElement;
    const formData = new FormData(uploadForm);
    formData.append('files[]', file);

    // Make the AJAX call to send the multipart form to the server
    // $.ajax({
    //     url: `${showdeoBaseUrl}/upload/`,
    //     type: 'POST',
    //     data: formData,
    //     processData: false,
    //     contentType: false
    // }).done((data) => {
    //
    // }).fail(() => {
    //
    // }).always(() => {
    //
    // });

}

function syncServerDownload() {
    const editor = atom.workspace.getActiveTextEditor();
    const filePath = editor.getPath();
    downloadFileFromServer(filePath);
}

function downloadFileFromServer(filePath) {

}

/**
 * Code chunk `modify_source` is triggered.
 * @param codeChunkData
 * @param result
 * @param filePath
 */
async function onModifySource(
    codeChunkData: mume.CodeChunkData,
    result,
    filePath,
) {
    function insertResult(i: number, editor: TextEditor, lines: string[]) {
        const lineCount = editor.getLineCount();
        let start = 0;
        // find <!- code_chunk_output -->
        for (let j = i + 1; j < i + 6 && j < lineCount; j++) {
            if (lines[j].startsWith("<!-- code_chunk_output -->")) {
                start = j;
                break;
            }
        }

        if (start) {
            // found
            // TODO: modify exited output
            let end = start + 1;
            while (end < lineCount) {
                if (lines[end].startsWith("<!-- /code_chunk_output -->")) {
                    break;
                }
                end += 1;
            }

            // if output not changed, then no need to modify editor buffer
            let r = "";
            for (let i2 = start + 2; i2 < end - 1; i2++) {
                r += lines[i2] + "\n";
            }
            if (r === result + "\n") {
                return "";
            } // no need to modify output
            editor
                .getBuffer()
                .setTextInRange([[start + 2, 0], [end - 1, 0]], result + "\n");
            /*
            editor.edit((edit)=> {
              edit.replace(new vscode.Range(
                new vscode.Position(start + 2, 0),
                new vscode.Position(end-1, 0)
              ), result+'\n')
            })
            */
            return "";
        } else {
            editor
                .getBuffer()
                .insert(
                    [i + 1, 0],
                    `<!-- code_chunk_output -->\n\n${result}\n\n<!-- /code_chunk_output -->\n`,
                );
            return "";
        }
    }

    const visibleTextEditors = atom.workspace.getTextEditors();
    for (let i = 0; i < visibleTextEditors.length; i++) {
        const editor = visibleTextEditors[i] as TextEditor;
        if (editor.getPath() === filePath) {
            let codeChunkOffset = 0;
            const targetCodeChunkOffset =
                codeChunkData.normalizedInfo.attributes["code_chunk_offset"];
            const lineCount = editor.getLineCount();
            const lines = editor.getBuffer().getLines();
            for (let i2 = 0; i2 < lineCount; i2++) {
                const line = lines[i2]; // editor.getBuffer().lines[i] will cause error.
                if (line.match(/^```(.+)\"?cmd\"?\s*[=\s]/)) {
                    if (codeChunkOffset === targetCodeChunkOffset) {
                        i2 = i2 + 1;
                        while (i2 < lineCount) {
                            if (lines[i2].match(/^\`\`\`\s*/)) {
                                break;
                            }
                            i2 += 1;
                        }
                        return insertResult(i2, editor, lines);
                    } else {
                        codeChunkOffset++;
                    }
                } else if (line.match(/\@import\s+(.+)\"?cmd\"?\s*[=\s]/)) {
                    if (codeChunkOffset === targetCodeChunkOffset) {
                        // console.log('find code chunk' )
                        return insertResult(i2, editor, lines);
                    } else {
                        codeChunkOffset++;
                    }
                }
            }
            break;
        }
    }
    return "";
}

mume.MarkdownEngine.onModifySource(onModifySource);

export function deactivate() {
    subscriptions.dispose();
}

export {configSchema as config} from "./config-schema";
