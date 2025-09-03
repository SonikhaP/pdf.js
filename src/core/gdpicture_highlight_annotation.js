class GDPictureHighlightAnnotation {
  static createNewAnnotation(xref, annotation, changes) {
    // Create a new annotation object from parsed data
    return Promise.resolve({
      annotationType: AnnotationEditorType.GDPICTURE_HIGHLIGHT,
      rect: annotation.rect,
      color: annotation.color,
      contents: annotation.contents || "",
      id: annotation.id,
    });
  }
}

export { GDPictureHighlightAnnotation };
