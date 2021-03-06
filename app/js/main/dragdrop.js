'use strict';

const DragDrop = {

    // AUTO: turns array of files into an object with only 1 video and 1 sub file
    analyzeDrop: (files) => {
        let f = {};
        for (let i = 0; i < files.length; i++) {
            // find first video
            if (!f.video && Files.detectFileType(files[i].path) === 'video') {
                f.video = files[i];
            }

            // find first subtitle
            if (!f.subtitle && Files.detectFileType(files[i].path) === 'subtitle') {
                f.subtitle = files[i];
            }

            // exit the loop once we have both
            if (f.subtitle && f.video) {
                break;
            }
        }
        return f;
    },

    // AUTO: on drop, notify of incompatible file or redirect file(s) to correct functions
    handleDrop: (files) => {
        // analyzeDrop sent back empty object
        if (Object.keys(files).length === 0) {
            console.debug('Dropped file is not supported');
            Notify.snack(i18n.__('Dropped file is not supported'));
        }

        // pass video and/or sub to main function Interface.add_video|add_subtitle
        for (let type in files) {
            // hide drag highlight defined in DragDrop.setup
            $('.section-file').css('border-color', '');

            // bring window on top
            win.focus();

            // add to main function
            console.debug('New File:', type, 'dropped');
            Interface['add_' + type](files[type].path, Object.keys(files).length === 2);

            // close popups if needed
            if ($('#search-popup').css('display') === 'block') {
                Interface.leavePopup({});
            }
            if ($('#upload-popup').css('display') === 'block') {
                Interface.reset('modal');
            }
        }
    },

    // STARTUP: manage drag & drop
    setup: () => {
        // disable default drag&drop events
        window.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
        window.addEventListener('dragstart', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
        window.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
        }, false);

        // when dragging over the app, display it in a user-friendly manner
        window.ondragenter = (e) => {
            $('#drop-mask').show();
            let showDrag = true;
            let timeout = -1;

            $('#drop-mask').on('dragenter', (e) => {
                // cache Files for a second
                DragDrop.files = [];

                // highlight video or sub interface part based on file extension
                for (let f in e.originalEvent.dataTransfer.files) {
                    DragDrop.files[f] = Files.detectFileType(e.originalEvent.dataTransfer.files[f].name);
                    if (DragDrop.files[f]) {
                        $('#main-' + DragDrop.files[f]).css('border-color', $('.dominant').css('background-color'));
                    }
                }
            });

            $('#drop-mask').on('dragover', (e) => {
                let showDrag = true;
            });

            $('#drop-mask').on('dragleave', (e) => {
                let showDrag = false;
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    if (!showDrag) {
                        // clean highlights
                        $('.section-file').css('border-color', '');
                    }
                }, 10);
            });
        };

        // when dropping file(s), loads it/them in
        window.ondrop = (e) => {
            e.preventDefault();
            $('#drop-mask').hide();

            // analyze then load file(s)
            DragDrop.handleDrop(DragDrop.analyzeDrop(e.dataTransfer.files));

            return false;
        };
    }
};