import {
  DirectUpload
} from "@rails/activestorage"

document.addEventListener("turbolinks:load", function () {
  console.log("hoge");

  const imageFileField = document.querySelector('#post_images'); // file_field
  const imageSelectButton = document.querySelector('#image-select-button'); // 画像選択ボタン
  const postFormButton = document.querySelector('#post-form-button'); // 送信ボタン

  let selectedImageBlobId = -1; // 選択した画像のblob_id（-1の場合は新規画像）

  const clickedEditButton = (e) => { // 変更ボタンをクリックした時に実行される処理
    console.log(e.target);

    const editButton = e.target; // e.targetにクリックされた削除ボタンが格納されている
    const previewWrapper = editButton.closest('.image-preview'); // プレビュー画像とボタンたちの祖先要素を取得する

    selectedImageBlobId = previewWrapper.getAttribute('data-image-blob-id');
    console.log(selectedImageBlobId);

    imageFileField.click();
  };

  imageSelectButton.addEventListener('click', () => {
    selectedImageBlobId = -1;
    console.log(selectedImageBlobId);
  });

  const editButtons = document.querySelectorAll('.image-edit-button');
  editButtons.forEach((button) => { // 変更ボタンにイベントを設定していく
    button.addEventListener('click', clickedEditButton);
  });

  const deleteImage = (blobId) => { // 渡されたblob_idの画像を削除する
    const addImageHidden = document.querySelector(`input[data-blob-id="${blobId}"]`); // 追加するための要素があるか確認
    if (addImageHidden) {
      // 追加するためのhidden_fieldがある場合、削除する
      addImageHidden.remove();
    } else {
      // 追加するためのhidden_fieldがない場合、削除するためのhidden_fieldを追加する
      const deleteImageBlobIdElement = // 削除したい画像のidをparamsに送るための要素
        `
        <input type="hidden" name="post[delete_image_blob_ids][]" value="${blobId}">
      `;
      const form = document.querySelector('form');
      form.insertAdjacentHTML("beforeend", deleteImageBlobIdElement); // deleteImageBlobIdElementをビューに追加
    }
  }

  const clickedDeleteButton = (e) => { // 削除ボタンをクリックした時に実行される処理
    console.log(e.target);

    const deleteButton = e.target; // e.targetにクリックされた削除ボタンが格納されている
    const previewWrapper = deleteButton.closest('.image-preview'); // プレビュー画像とボタンたちの祖先要素を取得する

    const deleteImageBlobId = previewWrapper.getAttribute('data-image-blob-id');
    console.log(deleteImageBlobId);

    deleteImage(deleteImageBlobId);

    previewWrapper.remove();
  }

  const deleteButtons = document.querySelectorAll('.image-delete-button');
  deleteButtons.forEach((button) => { // 削除ボタンにイベントを設定していく
    button.addEventListener('click', clickedDeleteButton);
  });

  postFormButton.addEventListener('click', (e) => { // file_fieldの内容が変化したら起動する
    // ーーー 追加ここから ーーー
    const previewImageLength = document.querySelectorAll('.image-preview').length; // プレビュー画像の枚数を数える
    if (previewImageLength < 1 || previewImageLength > 5) { // プレビュー画像が1枚未満、もしくは5枚より多いとき
      e.preventDefault();
      alert("画像は1枚以上5枚以下にしてください。");
    }
    // ーーー 追加ここまで ーーー
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
          <input type="hidden" name="post[new_images][]" value="${blob.signed_id}" data-blob-id="${blob.id}">
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

        if (selectedImageBlobId == -1) {
          // -1のとき=画像の新規追加
          console.log('画像を追加します');
          imageSelectButton.insertAdjacentHTML("beforebegin", previewHtml);
        } else {
          // -1でないとき=画像の変更
          console.log('画像を変更します');
          // 既存のプレビュー要素
          const oldPreview = document.querySelector(`.image-preview[data-image-blob-id="${selectedImageBlobId}"]`);
          oldPreview.outerHTML = previewHtml; // 既存のプレビューを新しいプレビューで書き換え

          deleteImage(selectedImageBlobId);
        }

        const insertedPreview = document.querySelector(`.image-preview[data-image-blob-id="${blob.id}"]`);
        const insertedDeleteButton = insertedPreview.querySelector('.image-delete-button');
        insertedDeleteButton.addEventListener('click', clickedDeleteButton); // 後から追加した削除ボタンにイベントを追加

        const insertedEditButton = insertedPreview.querySelector('.image-edit-button');
        insertedEditButton.addEventListener('click', clickedEditButton); // 後から追加した変更ボタンにイベントを追加
      }
    })

    imageFileField.value = '';

  });
});
