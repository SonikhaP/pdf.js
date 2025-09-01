export async function stampok({
  pdfViewer,
  annotationEditorUIManager,
  pdfDocument,
  l10n
}) {
  if (!pdfViewer) {
    console.error("pdfViewer ist nicht definiert.");
    return;
  }

  const eventBus = pdfViewer.eventBus;
  if (!eventBus) {
    console.error("eventBus ist nicht definiert on pdfViewer.");
    return;
  }

  // Reuse or initialize the manager
  if (!annotationEditorUIManager) {
    const { AnnotationEditorUIManager } = await import("../src/display/editor/tools.js");
    annotationEditorUIManager = new AnnotationEditorUIManager({ eventBus });
  }

  const currentPageNumber = pdfViewer.currentPageNumber;
  const pageView = pdfViewer.getPageView(currentPageNumber - 1);
  if (!pageView) {
    console.error("pageView ist nicht definiert.");
    return;
  }

  let annotationEditorLayer = pageView.annotationEditorLayer;
  if (!annotationEditorLayer) {
    const { AnnotationEditorLayer } = await import("../src/display/editor/annotation_editor_layer.js");

    annotationEditorLayer = new AnnotationEditorLayer({
      uiManager: annotationEditorUIManager,
      pageIndex: pageView.id - 1,
      div: pageView.div,
      annotationStorage: pdfDocument?.annotationStorage,
      l10n,
      eventBus,
      pdfPage: pageView.pdfPage,
      viewport: pageView.viewport,
      annotationCanvasMap: pageView.annotationCanvasMap,
      accessibilityManager: null,
      enableScripting: false,
      annotationEditorMode: 2,
    });

    pageView.div.appendChild(annotationEditorLayer.div);
    pageView.annotationEditorLayer = annotationEditorLayer;
    await annotationEditorLayer.enable();
  }

  const { StampEditor } = await import("../src/display/editor/stamp.js");

  const stamp = new StampEditor({
    parent: annotationEditorLayer,
    bitmapUrl: "images/annotation-tick.svg",
    x: 100,
    y: 100,
    width: 32,
    height: 32,
    uiManager: annotationEditorUIManager,
  });

  if (typeof annotationEditorLayer.addEditor === "function") {
    annotationEditorLayer.addEditor(stamp);
  } else {
    annotationEditorLayer.div.appendChild(stamp.div);
  }
}
