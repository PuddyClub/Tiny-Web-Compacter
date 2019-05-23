// Start
jQuery(function () {

    // Parser
    const URLPARSER = /(https?:\/\/[^\s]+)/g;

    // File
    const tinyProgress = {

        // Log Generator
        logGenerator: function (title, text) {

            $("#log").prepend(
                $("<span>").text("<"),
                $("<strong>").text(title),
                $("<span>").text("> "),
                text,
                $("<br>")
            );

        },

        // Complete
        complete: function () {

            // Send Final Message
            tinyProgress.logGenerator(
                'Complete',
                $("<font>", { class: "text-success" }).text('Progress complete! Sending the file to your local storage...')
            );

            try {

                // Send Download
                var blob = new Blob([tinyProgress.file], { type: "text/plain;charset=utf-8" });
                saveAs(blob, $("#uploadname").val() + "." + $("#uploadtype").val());

                // Reset Values
                tinyProgress.i = null;
                tinyProgress.total = null;
                tinyProgress.file = null;
                tinyProgress.data = null;

            } catch (err) {

                // ERROR!
                tinyProgress.logGenerator(
                    'Fail',
                    $("<font>", { class: "text-danger" }).text(err.message)
                );

            }

            $("#upload").removeAttr('disabled');

        },

        // Data
        i: null,
        total: null,
        file: null,
        data: null,

        // Send Data
        fire: function () {

            // Prepare URL
            tinyProgress.data[tinyProgress.i] = tinyProgress.data[tinyProgress.i].replace(/['"]+/g, '');
            tinyProgress.logGenerator(
                'Downloading URL',
                $("<font>", { class: "text-primary" }).text(tinyProgress.data[tinyProgress.i])
            );

            // Ajax
            $.ajax({
                url: tinyProgress.data[tinyProgress.i],
                beforeSend: function (xhr) {
                    xhr.overrideMimeType("text/plain; charset=x-user-defined");
                }
            })

                // Success
                .done(function (data) {

                    // Insert Into File
                    tinyProgress.i++;
                    tinyProgress.file += '\n\n\n\n/*\n\n URL FILE: ' + this.url + '\n\n*/\n\n' + data;

                    tinyProgress.logGenerator(
                        'File Success',
                        $("<font>", { class: "text-success" }).text('Download Complete!')
                    );

                    // Continue
                    if (tinyProgress.i < tinyProgress.total) {
                        tinyProgress.fire();
                    } else {
                        tinyProgress.complete();
                    }

                })

                // Fail
                .fail(function (e, textStatus) {

                    // Show Error
                    tinyProgress.i++;
                    tinyProgress.logGenerator(
                        'File Fail',
                        $("<font>", { class: "text-danger" }).text(textStatus)
                    );

                    // Continue
                    if (tinyProgress.i < tinyProgress.total) {
                        tinyProgress.fire();
                    } else {
                        tinyProgress.complete();
                    }

                });

        }

    };

    // The Fle Input
    $("#upload").change(function () {

        // Detector
        if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
            alert('The File APIs are not fully supported in this browser.');
            return;
        }

        // Freeze the input
        $(this).attr('disabled', 'diabled');

        // The Reader
        fr = new FileReader();
        fr.onload = function () {

            $("#log").empty().text('Starting the progress for a ' + $("#uploadtype").val() + ' file...');
            const items = fr.result.match(URLPARSER);
            $("#log").prepend(items.length + ' urls found. Starting the download of the files.<br/>');

            // Create Main File
            tinyProgress.file = '/*\n\n File made by Tiny Web Compacter\n Software made by Jasmin Dreasond\n\n https://github.com/JasminDreasond/Tiny-Web-Compacter\n\n*/';

            // Set Upload Config and start it
            tinyProgress.total = items.length;
            tinyProgress.data = items;
            tinyProgress.i = 0;
            tinyProgress.fire();

            delete items;

        };
        fr.readAsText(this.files[0]);
        //fr.readAsDataURL(this.files[0]);

    });

});