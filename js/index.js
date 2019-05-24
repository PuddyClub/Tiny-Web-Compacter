// Start
jQuery(function () {

    // Parser
    const URLPARSER = /(https?:\/\/[^\s]+)/g;

    const tinyLogScroll = function(){
        $("#log").animate({ scrollTop: $("#log").height() * 50 }, 0);
    };

    // File
    const tinyProgress = {

        // Log Generator
        logGenerator: function (title, text) {

            $("#log").append(
                $("<br>"),
                $("<span>").text("<"),
                $("<strong>").text(title),
                $("<span>").text("> "),
                text
            );

            tinyLogScroll();

        },

        // Complete
        complete: function () {

            // Send Final Message
            tinyProgress.logGenerator(
                'Complete',
                $("<font>", { class: "text-success" }).text('Progress complete! Sending the file to your local storage...')
            );

            try {

                // Select Type
                if ($("#uploadtype").val() == "css") {
                    var tinytype = "text/css;charset=utf-8";
                } else if ($("#uploadtype").val() == "js") {
                    var tinytype = "application/javascript;charset=utf-8";
                }

                // Send Download
                var blob = new Blob([tinyProgress.file], { type: tinytype });
                saveAs(blob, $("#uploadname").val() + "." + $("#uploadtype").val());

                tinyProgress.logGenerator(
                    'Congratulations',
                    $("<font>", { class: "text-success" }).text('All Done ^~^')
                );

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

            $(checkItems).removeAttr('disabled');
            checkUpType();

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
                    tinyProgress.file += '\n\n\n\n/*\n\n URL FILE: ' + this.url + '\n\n*/\n\n';

                    const tinypath = this.url.substring(0, this.url.lastIndexOf('/') + 1);
                    console.log(this.url);

                    // Fix CSS Files
                    if ($("#uploadtype").val() == "css") {
                        data = data.replace(
                            /url\s?\((.*?)\)/g, function (e, e2) {

                                // Get Start Text
                                if (e2.startsWith('"')) {
                                    e2 = e2.substring(1, e2.length - 1);
                                    var typeIntro = 1;
                                } else if (e2.startsWith("'")) {
                                    e2 = e2.substring(1, e2.length - 1);
                                    var typeIntro = 2;
                                }

                                

                                // Fix URL
                                if (!e2.startsWith('http') && !e2.startsWith('data:')) {

                                    tinyProgress.logGenerator(
                                        'Coverting',
                                        $("<font>", { class: "text-info" }).text('Before: ' + e2)
                                    );

                                    if ($("[name='urltype']:checked").val() == "auto") {
                                        e2 = tinypath + e2;
                                    } else if ($("[name='urltype']:checked").val() == "url") {
                                        e2 = $("#placeurl").val().replace('{autourl}', tinypath) + e2;
                                    }

                                    tinyProgress.logGenerator(
                                        'Coverting',
                                        $("<font>", { class: "text-info" }).text('After: ' + e2)
                                    );

                                }

                                // Send Result
                                if (typeIntro == 1) {
                                    return 'url("' + e2 + '")';
                                }
                                else if (typeIntro == 2) {
                                    return 'url(\'' + e2 + '\')';
                                } else {
                                    return 'url(' + e2 + ')';
                                }

                            }
                        )
                    }

                    // Insert into the file
                    tinyProgress.file += data;

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

                    delete tinypath;

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

    // Upload Fixed
    const checkUpType = function () {

        if ($("#uploadtype").val() == "css") {
            $("#placeurl, [name='urltype']").removeAttr('disabled');
            $("[name='urltype']:checked").trigger('change');
        } else {
            $("#placeurl, [name='urltype']").attr('disabled', 'disabled');
        }

    };

    const checkItems = "#upload, #uploadtype, #uploadname";
    $("#uploadtype").change(checkUpType);

    // URL Type
    $("[name='urltype']").change(function () {

        if ($("[name='urltype']:checked").val() == "url") {
            $("#placeurl").removeAttr('disabled');
        } else if ($("[name='urltype']:checked").val() == "auto") {
            $("#placeurl").attr('disabled', 'disabled');
        }

    });

    // The Fle Input
    $("#upload").change(function () {

        if (this.files[0]) {

            // Detector
            if (!window.File || !window.FileReader || !window.FileList || !window.Blob) {
                alert('The File APIs are not fully supported in this browser.');
                return;
            }

            // Freeze the input
            $("#upload, #uploadtype, #uploadname, [name='urltype'], #placeurl").attr('disabled', 'diabled');

            // The Reader
            fr = new FileReader();
            fr.onload = function () {

                $("#log").empty().text('Starting the progress for a ' + $("#uploadtype").val() + ' file...');
                const items = fr.result.match(URLPARSER);
                $("#log").append("<br/>"+items.length + ' urls found. Starting the download of the files.');
                tinyLogScroll();

                // Create Main File
                tinyProgress.file = '/*\n\n File made by Tiny Web Compacter\n Software made by Jasmin Dreasond\n\n https://github.com/JasminDreasond/Tiny-Web-Compacter\n\n*/';

                // Set Upload Config and start it
                tinyProgress.total = items.length;
                tinyProgress.data = items;
                tinyProgress.i = 0;
                tinyProgress.fire();

                delete items;

            }

            fr.onerror = function (message) {
                $("#log").empty().text(message);
                $(checkItems).removeAttr('disabled');
                checkUpType();
            };

            fr.readAsText(this.files[0]);
            //fr.readAsDataURL(this.files[0]);

        }

    });

});