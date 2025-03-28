import Image from '@tiptap/extension-image';

export function ImageDimensions(src) {
    return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = () =>
            resolve({ width: img.naturalWidth, height: img.naturalHeight });
        img.onerror = reject;
        img.src = src;
    });
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
            style: {
                default: () => 'width: 100%; height: auto;',
                parseHTML: (element) => element.style.cssText,
                renderHTML: () => ({}),
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

                    let newWidth = startWidth;
                    let newHeight = startHeight;

                    const onMouseMove = (e) => {
                        const ratio = startHeight / startWidth;
                        const dx = e.clientX - startX;
                        const dy = e.clientY - startY;

                        if (Math.abs(dx) > Math.abs(dy)) {
                            if (position === 'top-left' || position === 'bottom-left') {
                                newWidth = startWidth - dx;
                            } else {
                                newWidth = startWidth + dx;
                            }
                            newHeight = newWidth * ratio;
                        } else {
                            if (position === 'top-left' || position === 'top-right') {
                                newHeight = startHeight - dy;
                            } else {
                                newHeight = startHeight + dy;
                            }
                            newWidth = newHeight / ratio;
                        }

                        newWidth = Math.round(Math.max(newWidth, 50));
                        newHeight = Math.round(Math.max(newHeight, 50));

                        img.setAttribute('width', newWidth);
                        img.setAttribute('height', newHeight);
                    };

                    const onMouseUp = () => {
                        document.removeEventListener('mousemove', onMouseMove);
                        document.removeEventListener('mouseup', onMouseUp);
                        updateImageAttributes({
                            width: newWidth,
                            height: newHeight,
                        });
                    };

                    document.addEventListener('mousemove', onMouseMove);
                    document.addEventListener('mouseup', onMouseUp);
                });
            });

            return {
                dom: container,
                contentDOM: null,
            };
        };
    },

    addCommands() {
        return {
            setImage: (options) => ({ commands }) => {
                return commands.insertContent({
                    type: this.name,
                    attrs: options,
                });
            },
        };
    },
});
