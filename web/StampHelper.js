

export async function addStaticStamp({
  pdfViewer,
  annotationEditorUIManager,
  pdfDocument,
  l10n,
  imageUrl,
  x = 100,
  y = 100,
  width = 25,
  height = 25,
}) {
  if (!pdfViewer?.eventBus) {
    console.error("❌ pdfViewer or eventBus is not defined.");
    return;
  }

  const eventBus = pdfViewer.eventBus;

  // 📋 Ensure UI Manager exists
  if (!annotationEditorUIManager) {
    const { AnnotationEditorUIManager } = await import("../src/display/editor/tools.js");
    const fakeUndoBar = { hide: () => { } };
    annotationEditorUIManager = new AnnotationEditorUIManager(
      null,
      viewer,
      null,
      null,
      eventBus,
      pdfDocument,
      null,
      null,
      null,
      null,
      null,
      null,
      fakeUndoBar,
      null
    );
  }

  // 🖼️ Get page view and editor layer
  const currentPageNumber = pdfViewer.currentPageNumber;
  const pageView = pdfViewer.getPageView(currentPageNumber - 1);
  if (!pageView) return;

  await pageView.pdfPagePromise;

  let annotationEditorLayer = pageView.annotationEditorLayer?.annotationEditorLayer;
  if (!annotationEditorLayer) {
    const { AnnotationEditorLayer } = await import("../src/display/editor/annotation_editor_layer.js");

    const layerDiv = document.createElement("div");
    layerDiv.id = `page_${pageView.id}_annotation_editor_layer`;
    layerDiv.className = "annotationEditorLayer";
    pageView.div.appendChild(layerDiv);

    annotationEditorLayer = new AnnotationEditorLayer({
      uiManager: annotationEditorUIManager,
      pageIndex: pageView.id,
      div: layerDiv,
      annotationStorage: pdfDocument?.annotationStorage,
      l10n,
      eventBus,
      structTreeLayer: {},
      drawLayer: document.createElement("div"),
      pdfPage: pageView.pdfPage,
      viewport: pageView.viewport,
      annotationCanvasMap: pageView.annotationCanvasMap,
      accessibilityManager: null,
      enableScripting: false,
      annotationEditorMode: 2,
      enabled: true,
      parent: null,
    });

    annotationEditorLayer.annotationElementId = layerDiv.id;
    pageView.annotationEditorLayer = { annotationEditorLayer };
    pageView.div.appendChild(annotationEditorLayer.div);
  }

  // 🔓 Activate editor layer
  annotationEditorLayer.div.hidden = false;
  annotationEditorLayer.div.classList.remove("disabled");
  annotationEditorLayer.annotationEditorMode = 2;

  await annotationEditorLayer.enable();

  // ✒️ Build the stamp
  const { StampEditor } = await import("../src/display/editor/stamp.js");
  const stamp = new StampEditor({
    parent: annotationEditorLayer,
    bitmapUrl: imageUrl,
    x,
    y,
    width,
    height,
    uiManager: annotationEditorUIManager,
    isSvg: true,
    annotationElementId: `stamp_${pageView.id}_annotation_editor_layer`,
  });

  stamp.id = generateStaticStampId(imageUrl);

  if (annotationEditorLayer.editors?.has(stamp.id)) {
    console.warn("Stamp already exists with this ID. Skipping.");
    return;
  }
  // 💥 Inject it properly
  annotationEditorLayer.addUndoableEditor(stamp);
  stamp.select();

  // ✅ Confirm
  console.log("✅ Stamp added");
  console.log("Editor count:", annotationEditorLayer.editors?.size);
}

const stampIdCounters = {
  ok: 0,
  cross: 0,
  fragemark: 0,
  default: 0,
};

function generateStaticStampId(imageUrl) {
  if (imageUrl === "images/annotation-cross.svg") {
    return `pdfjs_internal_editor_cross_${stampIdCounters.cross++}`;
  } else if (imageUrl === "images/annotation-tick.svg") {
    return `pdfjs_internal_editor_ok_${stampIdCounters.ok++}`;
  } else if (imageUrl === "images/annotation-fragemark.svg") {
    return `pdfjs_internal_editor_fragemark_${stampIdCounters.fragemark++}`;
  }
  else {
    return `pdfjs_internal_editor_${stampIdCounters.default++}`;
  }
}
