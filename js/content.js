// content.js
(function () {
    'use strict';

    // 创建下载按钮容器
    const downloadButtonContainer = document.createElement('div');
    downloadButtonContainer.className = 'downloadImgButton';
    document.body.appendChild(downloadButtonContainer);

    // 创建下载按钮
    function createDownloadButtons() {
        const downloadAllButton = document.createElement('button');

        // 插入icon
        const icon = document.createElement('img');
        icon.src = chrome.runtime.getURL('img/down.svg');
        icon.className = 'downloadImgButton-icon';
        downloadAllButton.appendChild(icon);

        // 插入文字
        const text = document.createTextNode('下载产品');
        downloadAllButton.appendChild(text);

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
                const fileName = `主图_${String(index + 1).padStart(2, '0')}.${fileExtension}`;
                imagesData.push({ url: 'https:' + imageUrl, filename: fileName, type: 'main' });
            }
        });

        // 获取SKU图片 className="skuIcon" 的img标签
        const skuImages = document.querySelectorAll('.skuIcon'); // 选取SKU图片
        skuImages.forEach((image, index) => {
            let imageUrl = image.getAttribute('src') || image.getAttribute('data-src');
            if (imageUrl) {
                imageUrl = imageUrl.replace(/_\w*\.jpg_\w*\.webp/g, '');
                if (imageUrl.startsWith('//gw.alicdn.com')) {
                    const fileExtension = imageUrl.split('.').pop();
                    const fileName = `SKU_${String(index + 1).padStart(2, '0')}.${fileExtension}`;
                    imagesData.push({ url: 'https:' + imageUrl, filename: fileName, type: 'sku' });
                }
            }
        });

        // 获取详情页图片
        const detailImages = document.querySelectorAll('div.desc-root img[data-src], div.desc-root img[src]');
        detailImages.forEach((image, index) => {
            let imageUrl = image.getAttribute('data-src') || image.getAttribute('src');
            if (imageUrl && imageUrl.startsWith('https://img.alicdn.com')) {
                const fileExtension = imageUrl.split('.').pop().split('?')[0];
                const fileName = `详情_${String(index + 1).padStart(2, '0')}.${fileExtension}`;
                imagesData.push({ url: imageUrl, filename: fileName, type: 'detail' });
            }
        });

        // 发送图片数据到背景脚本以下载
        if (imagesData.length > 0) {
            chrome.runtime.sendMessage({ action: "downloadImages", images: imagesData, zipName: mainTitle || '下载的图片' });
        } else {
            console.log('没有找到可下载的图片。');
        }
    }

    // 创建下载按钮
    createDownloadButtons();
})();
