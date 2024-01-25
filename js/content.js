// content.js
(function() {
    'use strict';

    // 创建下载按钮容器
    const downloadButtonContainer = document.createElement('div');
    downloadButtonContainer.className = 'downloadImgButton';
    document.body.appendChild(downloadButtonContainer);

    // 创建下载按钮
    function createDownloadButtons() {
        // 创建一个按钮用于下载所有图片
        const downloadAllButton = document.createElement('button');
        downloadAllButton.innerHTML = '下载所有图片';
        downloadAllButton.addEventListener('click', downloadAllImages);
        downloadButtonContainer.appendChild(downloadAllButton);
    }

    // 获取商品主标题
    function getMainTitle() {
        const mainTitleElement = document.querySelector('h1[class^="ItemHeader--mainTitle"]');
        return mainTitleElement ? mainTitleElement.innerText : '';
    }

    // 准备下载所有图片
    function downloadAllImages() {
        const mainTitle = getMainTitle();
        const imagesData = [];

        // 获取主图
        const thumbnails = document.querySelectorAll('ul[class^="PicGallery--thumbnails"] img');
        thumbnails.forEach((thumbnail, index) => {
            const imageUrl = thumbnail.getAttribute('src').replace(/_\w*\.jpg_\w*\.webp/g, '');
            if (imageUrl && imageUrl.startsWith('//gw.alicdn.com')) {
                const fileExtension = imageUrl.split('.').pop();
                const fileName = `${mainTitle}_主图_${String(index + 1).padStart(2, '0')}.${fileExtension}`;
                imagesData.push({ url: 'https:' + imageUrl, filename: fileName });
            }
        });

        // 获取详情页图片
        const detailImages = document.querySelectorAll('div.desc-root img[data-src], div.desc-root img[src]');
        detailImages.forEach((image, index) => {
            let imageUrl = image.getAttribute('data-src') || image.getAttribute('src');
            if (imageUrl && imageUrl.startsWith('https://img.alicdn.com')) {
                const fileExtension = imageUrl.split('.').pop().split('?')[0];
                const fileName = `${mainTitle}_详情_${String(index + 1).padStart(2, '0')}.${fileExtension}`;
                imagesData.push({ url: imageUrl, filename: fileName });
            }
        });

        // 发送图片数据到背景脚本以下载
        if (imagesData.length > 0) {
            chrome.runtime.sendMessage({ action: "downloadImages", images: imagesData });
        } else {
            console.log('没有找到可下载的图片。');
        }
    }

    // 创建下载按钮
    createDownloadButtons();
})();
