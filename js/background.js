// background.js
try {
    self.importScripts('jszip.min.js'); // 确保路径是相对于服务工作线程的
    // JSZip is now loaded and can be used
  } catch (e) {
    console.error('Failed to load JSZip:', e);
  }
  
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
          // 将Blob对象转换为数据URL
          const reader = new FileReader();
          reader.onloadend = function() {
            // 使用数据URL进行下载
            chrome.downloads.download({
              url: reader.result,
              filename: zipName,
              saveAs: true, // 提示用户选择保存位置
              conflictAction: 'uniquify' // 避免文件名冲突
            }, function(downloadId) {
              if (chrome.runtime.lastError) {
                console.error('Download failed:', chrome.runtime.lastError);
              } else {
                console.log('File is being downloaded with ID:', downloadId);
              }
            });
          };
          reader.readAsDataURL(content);
        });
      });
    }
  });
  