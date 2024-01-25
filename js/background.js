// background.js
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === "downloadImages" && request.images) {
        const zip = new JSZip();

        // 对于每张图片，发起请求并将内容添加到 ZIP 文件
        const imagePromises = request.images.map(image => 
            fetch(image.url)
            .then(response => response.blob())
            .then(blob => zip.file(image.filename, blob))
        );

        // 等待所有图片处理完毕
        Promise.all(imagePromises).then(() => {
            zip.generateAsync({ type: "blob" }).then(function(content) {
                // 创建下载链接并触发下载
                const zipFilename = "images.zip";
                const link = document.createElement('a');
                link.href = URL.createObjectURL(content);
                link.download = zipFilename;
                link.click();
            });
        });
    }
});
