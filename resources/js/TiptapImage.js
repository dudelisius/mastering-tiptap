import Image from '@tiptap/extension-image';

// Utility: Generates a unique ID using crypto if available
function generateUniqueId(prefix = 'id') {
    if (window.crypto && crypto.getRandomValues) {
        return (
            prefix +
            '-' +
            ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
                (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
            )
        );
    }
    return prefix + '-' + Math.random().toString(36).substr(2, 9);
}

export function imageDimensions(src) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = (error) => reject(error);
        img.src = src;
    });
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Helper: Computes new dimensions based on mouse movement and a fixed aspect ratio.
function computeNewDimensions(startWidth, startHeight, startX, startY, currentX, currentY, position) {
    const ratio = startHeight / startWidth;
    const dx = currentX - startX;
    const dy = currentY - startY;
    let newWidth, newHeight;

    if (Math.abs(dx) > Math.abs(dy)) {
        newWidth = (position === 'top-left' || position === 'bottom-left')
            ? startWidth - dx
            : startWidth + dx;
        newHeight = newWidth * ratio;
    } else {
        newHeight = (position === 'top-left' || position === 'top-right')
            ? startHeight - dy
            : startHeight + dy;
        newWidth = newHeight / ratio;
    }

    newWidth = Math.round(Math.max(newWidth, 50));
    newHeight = Math.round(Math.max(newHeight, 50));
    return { newWidth, newHeight };
}

export async function imageDropUpload(editor, view, event, moved, component) {
    event.preventDefault();

    if (moved || !event.dataTransfer?.files?.[0]) {
        return false;
    }

    const file = event.dataTransfer.files[0];
    const placeholderId = generateUniqueId('placeholder');
    const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY });

    try {
        const fileDataUrl = await readFileAsDataUrl(file);
        const dimensions = await imageDimensions(fileDataUrl);

        // Insert a placeholder image with uploading class.
        editor.commands.setImage({
            pos: coordinates.pos,
            src: fileDataUrl,
            dimensions,
            class: 'uploading',
            id: placeholderId,
        });

        // Wrap the component.upload callback API into a promise.
        await new Promise((resolve, reject) => {
            component.upload(
                'image',
                file,
                (fileInfo) => resolve(fileInfo),
                (error) => reject(error)
            );
        });

        // After the upload, call the imageUpload API.
        const fileInfo = await component.call('imageUpload');
        if (fileInfo.errors) {
            imageDelete(editor, placeholderId);
            console.error('Error processing the image:', fileInfo.errors);
            return;
        }
        imageUpdateAttributes(editor, placeholderId, {
            src: fileInfo.src,
            ...dimensions,
            class: '',
            id: '',
        });
    } catch (error) {
        imageDelete(editor, placeholderId);
        console.error('Error processing the image:', error);
    }
}

export function imageUpdateAttributes(editor, id, attributes) {
    const { state, dispatch } = editor.view;
    state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.id === id) {
            dispatch(state.tr.setNodeMarkup(pos, undefined, { ...attributes }));
        }
    });
}

export function imageDelete(editor, id) {
    const { state, dispatch } = editor.view;
    let tr = state.tr;

    state.doc.descendants((node, pos) => {
        if (node.type.name === 'image' && node.attrs.id === id) {
            tr = tr.delete(pos, pos + node.nodeSize);
            return false;
        }
    });

    if (tr.docChanged) {
        dispatch(tr);
    }
}

export const ImageResize = Image.extend({
    addAttributes() {
        return {
            ...(this.parent ? this.parent() : {}),
            width: {
                default: null,
                parseHTML: (element) => element.getAttribute('width'),
                renderHTML: (attributes) =>
                    attributes.width ? { width: attributes.width } : {},
            },
            height: {
                default: null,
                parseHTML: (element) => element.getAttribute('height'),
                renderHTML: (attributes) =>
                    attributes.height ? { height: attributes.height } : {},
            },
            class: {
                default: null,
                parseHTML: (element) => element.getAttribute('class'),
                renderHTML: (attributes) =>
                    attributes.class ? { class: attributes.class } : {},
            },
            id: {
                default: null,
                parseHTML: (element) => element.getAttribute('id'),
                renderHTML: (attributes) =>
                    attributes.id ? { id: attributes.id } : {},
            },
        };
    },

    addNodeView() {
        return ({ node, updateAttributes, view, getPos }) => {
            const updateImageAttributes = (attrs) => {
                if (typeof updateAttributes === 'function') {
                    updateAttributes(attrs);
                } else if (typeof getPos === 'function') {
                    const pos = getPos();
                    const newAttrs = { ...node.attrs, ...attrs };
                    const marks = node.type.inline ? [] : node.marks;
                    const transaction = view.state.tr.setNodeMarkup(pos, undefined, newAttrs, marks);
                    view.dispatch(transaction);
                }
            };

            const container = document.createElement('div');
            container.style.position = 'relative';
            container.style.display = 'inline-block';

            const img = document.createElement('img');
            img.src = node.attrs.src;

            if (node.attrs.width) {
                img.setAttribute('width', Math.round(node.attrs.width));
            }

            if (node.attrs.height) {
                img.setAttribute('height', Math.round(node.attrs.height));
            }

            if (node.attrs.class) {
                img.setAttribute('class', node.attrs.class);
            }

            if (node.attrs.id) {
                img.setAttribute('id', node.attrs.id);
            }

            container.appendChild(img);

            const createHandle = (position) => {
                const handle = document.createElement('div');
                handle.className = `resize-handle ${position}`;
                return handle;
            };

            const positions = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];
            const handles = {};

            positions.forEach((pos) => {
                const handle = createHandle(pos);
                handles[pos] = handle;
                container.appendChild(handle);
            });

            positions.forEach((position) => {
                const handle = handles[position];

                handle.addEventListener('mousedown', (event) => {
                    event.preventDefault();

                    const startX = event.clientX;
                    const startY = event.clientY;
                    const startWidth = img.getAttribute('width')
                        ? parseInt(img.getAttribute('width'))
                        : img.offsetWidth;
                    const startHeight = img.getAttribute('height')
                        ? parseInt(img.getAttribute('height'))
                        : img.offsetHeight;

                    let currentWidth = startWidth;
                    let currentHeight = startHeight;

                    const onMouseMove = (e) => {
                        const { newWidth, newHeight } = computeNewDimensions(
                            startWidth,
                            startHeight,
                            startX,
                            startY,
                            e.clientX,
                            e.clientY,
                            position
                        );
                        currentWidth = newWidth;
                        currentHeight = newHeight;
                        img.setAttribute('width', currentWidth);
                        img.setAttribute('height', currentHeight);
                    };

                    const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        updateImageAttributes({
                            width: currentWidth,
                            height: currentHeight,
                        });
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp, { once: true });
                });
            });

            return {
                dom: container,
                contentDOM: null,
                stopEvent: (event) =>
                    node.attrs.uploading ||
                    (node.attrs.class && node.attrs.class.includes('uploading')),
            };
        };
    },

    addCommands() {
        return {
            setImage: (options) => ({ commands }) => {
                if (options.pos) {
                    return commands.insertContentAt(options.pos, {
                        type: this.name,
                        attrs: options,
                    });
                } else {
                    return commands.insertContent({
                        type: this.name,
                        attrs: options,
                    });
                }
            },
        };
    },
});
