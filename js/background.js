// background.js
try {
    self.importScripts('jszip.min.js'); // 确保路径是相对于服务工作线程的
    // JSZip is now loaded and can be used
} catch (e) {
    console.error('Failed to load JSZip:', e);
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action === "downloadImages" && request.images) {
        const zip = new JSZip();
        const mainFolderName = request.zipName.replace(/[\/\\:*?"<>|]/g, '_'); // 移除非法字符
        const mainFolder = zip.folder(mainFolderName);
        const detailFolder = zip.folder(`${mainFolderName}/详情图`);
        const skuFolder = zip.folder(`${mainFolderName}/SKU图`);
        const imageFetchPromises = [];

        request.images.forEach(image => {
            const imagePromise = fetch(image.url)
                .then(response => response.blob())
                .then(blob => {
                    if (image.type === 'main') {
                        mainFolder.file(image.filename, blob);
                    } else if (image.type === 'detail') {
                        detailFolder.file(image.filename, blob);
                    } else if (image.type === 'sku') {
                        skuFolder.file(image.filename, blob);
                    }
                }).catch(e => console.error('Failed to fetch image:', e));
            imageFetchPromises.push(imagePromise);
        });

        // 等待所有图片fetch操作完成
        Promise.all(imageFetchPromises).then(() => {
            zip.generateAsync({ type: "blob" }).then(function (content) {
                const reader = new FileReader();
                reader.onloadend = function () {
                    chrome.downloads.download({
                        url: reader.result,
                        filename: `${mainFolderName}.zip`,
                        saveAs: true,
                        conflictAction: 'uniquify'
                    }, function (downloadId) {
                        if (chrome.runtime.lastError) {
                            console.error('Download failed:', chrome.runtime.lastError);
                        } else {
                            console.log('File is being downloaded with ID:', downloadId);
                        }
                    });
                };
                reader.readAsDataURL(content);
            }).catch(e => console.error('Failed to generate ZIP:', e));
        });
    }
});
