// background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "downloadImages" && request.images) {
        const zip = new JSZip();
        const zipName = request.zipName.replace(/[\/\\:*?"<>|]/g, '_') + '.zip'; // 移除非法字符

        const imagePromises = request.images.map(image => 
            fetch(image.url)
            .then(response => response.blob())
            .then(blob => zip.file(image.filename, blob))
        );

        Promise.all(imagePromises).then(() => {
            zip.generateAsync({ type: "blob" }).then(function(content) {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = zipName;
                link.click();
            });
        });
    }
});
