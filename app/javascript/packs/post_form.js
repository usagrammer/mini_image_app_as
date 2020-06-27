import {
  DirectUpload
} from "@rails/activestorage"

document.addEventListener("turbolinks:load", function () {
  console.log("hoge");

  const imageFileField = document.querySelector('#post_images'); // file_field
  const imageSelectButton = document.querySelector('#image-select-button'); // 画像選択ボタン

  const clickedDeleteButton = (e) => { // 削除ボタンをクリックした時に実行される処理
    console.log(e.target);

    const deleteButton = e.target; // e.targetにクリックされた削除ボタンが格納されている
    const previewWrapper = deleteButton.closest('.image-preview'); // プレビュー画像とボタンたちの祖先要素を取得する

    const deleteImageBlobId = previewWrapper.getAttribute('data-image-blob-id');
    console.log(deleteImageBlobId);

    const deleteImageBlobIdElement = // 削除したい画像のidをparamsに送るための要素
      `
        <input type="hidden" name="post[delete_image_blob_ids][]" value="${deleteImageBlobId}">
      `;
    const form = document.querySelector('form');
    form.insertAdjacentHTML("beforeend", deleteImageBlobIdElement); // deleteImageBlobIdElementをビューに追加
    // --- 追加ここまで ----

    previewWrapper.remove();
  }

  const deleteButtons = document.querySelectorAll('.image-delete-button');
  deleteButtons.forEach((button) => { // 削除ボタンにイベントを設定していく
    button.addEventListener('click', clickedDeleteButton);
  });

  imageFileField.addEventListener('change', (e) => { // file_fieldの内容が変化したら起動する
    console.log('画像が選択されました');
    console.table(e.target.files);

    const file = e.target.files[0]; // e.target.filesは配列のような状態になっている

    const url = imageFileField.dataset.directUploadUrl; // file_fieldに対して「.dataset.directUploadUrl」を実行する
    const upload = new DirectUpload(file, url);
    upload.create((error, blob) => { // errorはエラー情報、blobはアップロードしたファイルの情報
      if (error) {
        // アップロードに失敗した時の処理
      } else {
        // アップロードに成功した時の処理
        console.table(blob);

        const newImageFile =
          `
          <input type="hidden" name="post[new_images][]" value="${blob.signed_id}">
        `;
        const form = document.querySelector('form');
        form.insertAdjacentHTML("beforeend", newImageFile);

        const blobUrl = window.URL.createObjectURL(file); // フォームに入っているファイルのパスを取得する
        console.log(blobUrl);

        const previewHtml =
          `
            <div class="image-preview" data-image-blob-id="${blob.id}">
              <img src="${blobUrl}" class="image-preview__image">
              <div class="image-preview-buttons">
                <div class="image-edit-button">変更</div>
                <div class="image-delete-button">削除</div>
              </div>
            </div>
          `;
        imageSelectButton.insertAdjacentHTML("beforebegin", previewHtml);
        // --- 追加ここから ----
        const insertedPreview = document.querySelector(`.image-preview[data-image-blob-id="${blob.id}"]`);
        const insertedDeleteButton = insertedPreview.querySelector('.image-delete-button');
        insertedDeleteButton.addEventListener('click', clickedDeleteButton);
        // --- 追加ここまで ----
      }
    })

    imageFileField.value = '';

  });
});
