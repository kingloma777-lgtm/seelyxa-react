/* The menu API is not stable about where a category picture lives: a real
 * category tree carries `image`, a builder item may put it in `thumbnail`,
 * `icon`, `media.image`, or an `images` array, and some answers only expose an
 * url somewhere deeper in the row. This resolver was inlined in `MorphCurtain`
 * after the October image audit; it lives here so the curtain's render stays
 * about layout and the search can be reused and pinned by tests.

 * The order is deliberate: explicit fields first, then any key whose NAME
 * looks like an image, then a bounded depth-first walk. An arbitrary deep
 * string is a last resort, never the first answer. */
export function menuNodeImage(node: unknown): string {
  const getImg = (v: unknown): string => {
    if (!v) return '';
    if (typeof v === 'string') {
      if (v.startsWith('http') || v.startsWith('/') || v.startsWith('data:')) return v;
      if (
        v.length > 10 &&
        (v.includes('.jpg') || v.includes('.png') || v.includes('.webp') ||
          v.includes('.jpeg') || v.includes('.gif'))
      ) return v;
      return v;
    }
    if (Array.isArray(v)) return getImg(v[0]);
    if (typeof v === 'object') {
      return (
        getImg((v as Record<string, unknown>).url) ||
        getImg((v as Record<string, unknown>).image) ||
        getImg((v as Record<string, unknown>).src) ||
        getImg((v as Record<string, unknown>).small_url) ||
        getImg((v as Record<string, unknown>).thumbnail) ||
        getImg((v as Record<string, unknown>).value) ||
        getImg((v as Record<string, unknown>).link) ||
        getImg((v as Record<string, unknown>).original) ||
        getImg((v as Record<string, unknown>).file) ||
        getImg((v as Record<string, unknown>).path) ||
        getImg((v as Record<string, unknown>).logo) ||
        getImg((v as Record<string, unknown>).icon) ||
        getImg((v as Record<string, unknown>).img) ||
        ''
      );
    }
    return '';
  };

  const record = (node ?? {}) as Record<string, unknown>;
  let img = '';
  if (typeof record.image === 'string' && record.image) {
    const s = record.image;
    if (s.startsWith('http') || s.startsWith('/') || s.includes('.')) img = s;
  }
  img = img || getImg(record.image);
  img = img || getImg(record.thumbnail);
  img = img || getImg(record.icon);
  img = img || getImg(record.image_url);
  img = img || getImg(record.imageUrl);
  img = img || getImg(record.cover);
  img = img || getImg(record.media);
  img = img || getImg(record.media && (record.media as Record<string, unknown>).image);
  img = img || getImg(record.media && (record.media as Record<string, unknown>).url);
  img = img || getImg(record.banner);
  img = img || getImg(record.picture);
  img = img || getImg(record.photo);
  img = img || getImg(record.featured_image);
  img = img || getImg(record.category_image);
  img = img || getImg(record.thumb);
  img = img || getImg(record.logo);
  img = img || getImg(record.images);
  /* Never feed the WHOLE row to getImg(): its first key is `url`, so a row
     without a picture came back with its own navigation link as a "photo"
     (a broken background request on every such disc). Named/image-ish keys
     only — the loops below. */

  if (!img) {
    for (const key of Object.keys(record)) {
      const lower = key.toLowerCase();
      if (
        lower.includes('image') || lower.includes('img') || lower.includes('photo') ||
        lower.includes('icon') || lower.includes('thumb') || lower.includes('pic') ||
        lower.includes('avatar') || lower.includes('cover') || lower.includes('banner')
      ) {
        const found = getImg(record[key]);
        if (found) {
          img = found;
          break;
        }
      }
    }
  }

  if (!img) {
    const search = (obj: unknown, depth = 0): string => {
      if (!obj || depth > 4) return '';
      if (typeof obj === 'string') {
        if (
          obj.startsWith('http') &&
          (obj.includes('.jpg') || obj.includes('.png') || obj.includes('.jpeg') ||
            obj.includes('.webp') || obj.includes('.gif') || obj.includes('cdn') ||
            obj.includes('images'))
        ) return obj;
        if ((obj.startsWith('/') && obj.includes('.')) || obj.includes('uploads') || obj.includes('media')) return obj;
        return '';
      }
      if (Array.isArray(obj)) {
        for (const item of obj) {
          const found = search(item, depth + 1);
          if (found) return found;
        }
        return '';
      }
      if (typeof obj === 'object') {
        const rec = obj as Record<string, unknown>;
        for (const k of ['image', 'url', 'src', 'thumbnail', 'icon', 'photo', 'picture']) {
          if (rec[k]) {
            const found = search(rec[k], depth + 1);
            if (found) return found;
          }
        }
        for (const k of Object.keys(rec)) {
          const lower = k.toLowerCase();
          if (lower.includes('image') || lower.includes('img') || lower.includes('photo') || lower.includes('thumb')) {
            const found = search(rec[k], depth + 1);
            if (found) return found;
          }
        }
      }
      return '';
    };
    img = search(node);
  }
  return img;
}
