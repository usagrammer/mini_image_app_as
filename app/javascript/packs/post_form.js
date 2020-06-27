import {
  DirectUpload
} from "@rails/activestorage"

document.addEventListener("turbolinks:load", function () {
  console.log("hoge");

  const imageFileField = document.querySelector('#post_images'); // file_field
  const imageSelectButton = document.querySelector('#image-select-button'); // 画像選択ボタン

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

        // --- 変更ここから ----
        const previewHtml =
          `
        <div class="image-preview">
          <img src="${blobUrl}" class="image-preview__image">
          <div class="image-preview-buttons">
            <div class="image-edit-button">変更</div>
            <div class="image-delete-button">削除</div>
          </div>
        </div>
        `;
        // --- 変更ここまで ----
        imageSelectButton.insertAdjacentHTML("beforebegin", previewHtml);
      }
    })

    imageFileField.value = '';

  });
});
