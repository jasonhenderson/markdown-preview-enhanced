"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ShowdeoSimplePreviewConfig {
    static getCurrentConfig() {
        return new ShowdeoSimplePreviewConfig();
    }
    constructor() {
        /*
         * MarkdownEngineConfig properties
         */
        this.usePandocParser = atom.config.get("showdeo-simple-preview.usePandocParser");
        this.breakOnSingleNewLine = atom.config.get("showdeo-simple-preview.breakOnSingleNewLine");
        this.enableTypographer = atom.config.get("showdeo-simple-preview.enableTypographer");
        this.enableLinkify = atom.config.get("showdeo-simple-preview.enableLinkify");
        this.enableWikiLinkSyntax = atom.config.get("showdeo-simple-preview.enableWikiLinkSyntax");
        this.enableEmojiSyntax = atom.config.get("showdeo-simple-preview.enableEmojiSyntax");
        this.enableExtendedTableSyntax = atom.config.get("showdeo-simple-preview.enableExtendedTableSyntax");
        this.enableCriticMarkupSyntax = atom.config.get("showdeo-simple-preview.enableCriticMarkupSyntax");
        this.wikiLinkFileExtension = atom.config.get("showdeo-simple-preview.wikiLinkFileExtension");
        this.protocolsWhiteList = atom.config.get("showdeo-simple-preview.protocolsWhiteList");
        this.mathRenderingOption = atom.config.get("showdeo-simple-preview.mathRenderingOption");
        try {
            this.mathInlineDelimiters = JSON.parse(atom.config.get("showdeo-simple-preview.mathInlineDelimiters"));
        }
        catch (error) {
            this.mathInlineDelimiters = [["$", "$"], ["\\(", "\\)"]];
        }
        try {
            this.mathBlockDelimiters = JSON.parse(atom.config.get("showdeo-simple-preview.mathBlockDelimiters"));
        }
        catch (error) {
            this.mathBlockDelimiters = [["$$", "$$"], ["\\[", "\\]"]];
        }
        this.codeBlockTheme = atom.config.get("showdeo-simple-preview.codeBlockTheme");
        this.previewTheme = atom.config.get("showdeo-simple-preview.previewTheme");
        this.revealjsTheme = atom.config.get("showdeo-simple-preview.revealjsTheme");
        this.mermaidTheme = atom.config.get("showdeo-simple-preview.mermaidTheme");
        this.frontMatterRenderingOption = atom.config.get("showdeo-simple-preview.frontMatterRenderingOption");
        this.imageFolderPath = atom.config.get("showdeo-simple-preview.imageFolderPath");
        this.printBackground = atom.config.get("showdeo-simple-preview.printBackground");
        this.phantomPath = atom.config.get("showdeo-simple-preview.phantomPath");
        this.pandocPath = atom.config.get("showdeo-simple-preview.pandocPath");
        this.pandocMarkdownFlavor = atom.config.get("showdeo-simple-preview.pandocMarkdownFlavor");
        this.pandocArguments =
            atom.config
                .get("showdeo-simple-preview.pandocArguments")
                .split(",")
                .map((x) => x.trim())
                .filter((x) => x.length) || [];
        this.latexEngine = atom.config.get("showdeo-simple-preview.latexEngine");
        this.enableScriptExecution = atom.config.get("showdeo-simple-preview.enableScriptExecution");
        /*
         * Extra configs for mpe
         */
        this.fileExtension = atom.config
            .get("showdeo-simple-preview.fileExtension")
            .split(",")
            .map((x) => x.trim())
            .filter((x) => x.length) || [".md", ".mmark", ".markdown"];
        this.singlePreview = atom.config.get("showdeo-simple-preview.singlePreview");
        this.scrollSync = atom.config.get("showdeo-simple-preview.scrollSync");
        this.liveUpdate = atom.config.get("showdeo-simple-preview.liveUpdate");
        this.previewPanePosition = atom.config.get("showdeo-simple-preview.previewPanePosition");
        this.openPreviewPaneAutomatically = atom.config.get("showdeo-simple-preview.openPreviewPaneAutomatically");
        this.automaticallyShowPreviewOfMarkdownBeingEdited = atom.config.get("showdeo-simple-preview.automaticallyShowPreviewOfMarkdownBeingEdited");
        this.closePreviewAutomatically = atom.config.get("showdeo-simple-preview.closePreviewAutomatically");
        // this.enableZenMode = atom.config.get('showdeo-simple-preview.enableZenMode')
        this.imageUploader = atom.config.get("showdeo-simple-preview.imageUploader");
        this.imageDropAction = atom.config.get("showdeo-simple-preview.imageDropAction");
    }
    onDidChange(subscriptions, callback) {
        subscriptions.add(atom.config.onDidChange("showdeo-simple-preview.usePandocParser", ({ newValue }) => {
            this.usePandocParser = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.breakOnSingleNewLine", ({ newValue }) => {
            this.breakOnSingleNewLine = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.enableTypographer", ({ newValue }) => {
            this.enableTypographer = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.enableLinkify", ({ newValue }) => {
            this.enableLinkify = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.enableWikiLinkSyntax", ({ newValue }) => {
            this.enableWikiLinkSyntax = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.enableEmojiSyntax", ({ newValue }) => {
            this.enableEmojiSyntax = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.enableExtendedTableSyntax", ({ newValue }) => {
            this.enableExtendedTableSyntax = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.enableCriticMarkupSyntax", ({ newValue }) => {
            this.enableCriticMarkupSyntax = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.wikiLinkFileExtension", ({ newValue }) => {
            this.wikiLinkFileExtension = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.protocolsWhiteList", ({ newValue }) => {
            this.protocolsWhiteList = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.mathRenderingOption", ({ newValue }) => {
            this.mathRenderingOption = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.mathInlineDelimiters", ({ newValue }) => {
            let mathInlineDelimiters;
            try {
                mathInlineDelimiters = JSON.parse(newValue);
                if (JSON.stringify(mathInlineDelimiters) !==
                    JSON.stringify(this.mathInlineDelimiters)) {
                    this.mathInlineDelimiters = mathInlineDelimiters;
                    callback();
                }
            }
            catch (error) {
                mathInlineDelimiters = [["$", "$"], ["\\(", "\\)"]];
            }
        }), atom.config.onDidChange("showdeo-simple-preview.mathBlockDelimiters", ({ newValue }) => {
            let mathBlockDelimiters;
            try {
                mathBlockDelimiters = JSON.parse(newValue);
                if (JSON.stringify(mathBlockDelimiters) !==
                    JSON.stringify(this.mathBlockDelimiters)) {
                    this.mathBlockDelimiters = mathBlockDelimiters;
                    callback();
                }
            }
            catch (error) {
                mathBlockDelimiters = [["$$", "$$"], ["\\[", "\\]"]];
            }
        }), atom.config.onDidChange("showdeo-simple-preview.fileExtension", ({ newValue }) => {
            this.fileExtension =
                newValue
                    .split(",")
                    .map((x) => x.trim())
                    .filter((x) => x.length) || [];
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.singlePreview", ({ newValue }) => {
            this.singlePreview = newValue;
            // callback() // <= No need to call callback. will cause error here.
        }), atom.config.onDidChange("showdeo-simple-preview.scrollSync", ({ newValue }) => {
            this.scrollSync = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.liveUpdate", ({ newValue }) => {
            this.liveUpdate = newValue;
            // callback()
        }), atom.config.onDidChange("showdeo-simple-preview.previewPanePosition", ({ newValue }) => {
            this.previewPanePosition = newValue;
        }), atom.config.onDidChange("showdeo-simple-preview.openPreviewPaneAutomatically", ({ newValue }) => {
            this.openPreviewPaneAutomatically = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.automaticallyShowPreviewOfMarkdownBeingEdited", ({ newValue }) => {
            this.automaticallyShowPreviewOfMarkdownBeingEdited = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.closePreviewAutomatically", ({ newValue }) => {
            this.closePreviewAutomatically = newValue;
            callback();
        }), 
        /*
        atom.config.onDidChange('showdeo-simple-preview.enableZenMode', ({newValue})=> {
          this.enableZenMode = newValue
          // callback()
        }),
        */
        atom.config.onDidChange("showdeo-simple-preview.imageUploader", ({ newValue }) => {
            this.imageUploader = newValue;
            callback();
        }), atom.config.onDidChange("showdeo-simple-preview.imageDropAction", ({ newValue }) => {
            this.imageDropAction = newValue;
        }));
    }
}
exports.ShowdeoSimplePreviewConfig = ShowdeoSimplePreviewConfig;
//# sourceMappingURL=config.js.map