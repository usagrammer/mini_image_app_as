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

        // --- 追加ここから ----
        const newImageFile = document.createElement('input')
        newImageFile.setAttribute("type", "hidden");
        newImageFile.setAttribute("value", blob.signed_id);
        newImageFile.name = "post[new_images][]";
        document.querySelector('form').appendChild(newImageFile);
        // --- 追加ここまで ----

        const blobUrl = window.URL.createObjectURL(file); // フォームに入っているファイルのパスを取得する
        console.log(blobUrl);

        const previewHtml = `<img src="${blobUrl}">`;
        imageSelectButton.insertAdjacentHTML("beforebegin", previewHtml);
      }
    })

    imageFileField.value = '';

  });
});
