export function createGdPictureAnnotationClass(Annotation) {
  return class GdPictureRectangleHighlighterAnnotation extends Annotation {
    constructor(params) {
      super(params);

      const { dict, ref } = params;

      const rawRect = dict.getArray("Rect") || [100, 100, 200, 120];
      const [x1, y1, x2, y2] = rawRect;
      this.rect = [
        Math.min(x1, x2),
        Math.min(y1, y2),
        Math.max(x1, x2),
        Math.max(y1, y2),
      ];

      this.contents = dict.get("Contents");
      this.color = dict.has("C") ? dict.getArray("C") : [1, 1, 0];
      this.hasPopupData = !!this.contents;
      this.annotationType = 1001;

      this.data = {
        id: params.id || (ref instanceof Ref ? ref.toString() : `annot_${Math.random().toString(36).slice(2)}`),
        annotationType: this.annotationType,
        subtype: "GdPicture-AnnotationTypeRectangleHighlighter",
        rect: this.rect,
        color: this.color,
        contents: this.contents,
        hasAppearance: false,
        isRenderable: true,
      };

      console.log("✅ GdPicture annotation parsed:", this.data);
    }
  };
}
