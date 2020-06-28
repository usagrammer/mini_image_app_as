import {
  DirectUpload
} from "@rails/activestorage"

document.addEventListener("turbolinks:load", function () {
  const imageFileField = document.querySelector('#post_images'); // file_field
  const imageSelectButton = document.querySelector('#image-select-button'); // 画像選択ボタン
  const postFormButton = document.querySelector('#post-form-button'); // 送信ボタン

  let selectedImageBlobId = -1; // 選択した画像のblob_id（-1の場合は新規画像）

  const clickedEditButton = (e) => { // 変更ボタンをクリックした時に実行される処理
    const editButton = e.target; // e.targetにクリックされた変更ボタンが格納されている
    const previewWrapper = editButton.closest('.image-preview'); // プレビュー画像とボタンたちの祖先要素を取得する

    selectedImageBlobId = previewWrapper.getAttribute('data-image-blob-id'); // 選択した画像のblob_idを取得する

    imageFileField.click(); // file_fieldをクリックさせる
  };

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
    const deleteButton = e.target; // e.targetにクリックされた削除ボタンが格納されている
    const previewWrapper = deleteButton.closest('.image-preview'); // プレビュー画像とボタンたちの祖先要素を取得する

    const deleteImageBlobId = previewWrapper.getAttribute('data-image-blob-id'); // 削除する画像のblob_id
    deleteImage(deleteImageBlobId);
    previewWrapper.remove(); // プレビュー画像とボタンたちの祖先要素を削除する
  }

  const imageSelected = (e) => { // file_fieldの内容が変化した時の処理
    const file = e.target.files[0]; // 選択されたファイルがe.target.filesに配列のような状態で入っている

    const url = imageFileField.dataset.directUploadUrl; // file_fieldに対して「.dataset.directUploadUrl」を実行する
    const upload = new DirectUpload(file, url); // ダイレクトアップロードの準備
    upload.create((error, blob) => { // errorはエラー情報、blobはアップロードしたファイルの情報
      if (error) {
        // アップロードに失敗した時の処理
      } else {
        // アップロードに成功した時の処理
        const newImageFile = // 新しい画像のデータをparamsに送るための要素
          `
            <input type="hidden" name="post[new_images][]" value="${blob.signed_id}" data-blob-id="${blob.id}">
          `;
        const form = document.querySelector('form');
        form.insertAdjacentHTML("beforeend", newImageFile); // フォームに新しい画像のデータをparamsに送るための要素を追加する

        const blobUrl = window.URL.createObjectURL(file); // フォームに入っているファイルのパスを取得する

        const previewHtml = // プレビューのための要素
          `
            <div class="image-preview" data-image-blob-id="${blob.id}">
              <img src="${blobUrl}" class="image-preview__image">
              <div class="image-preview-buttons">
                <div class="image-edit-button">変更</div>
                <div class="image-delete-button">削除</div>
              </div>
            </div>
          `;

        if (selectedImageBlobId == -1) { // 画像の追加か変更かを判定する
          // -1のとき=画像の新規追加
          imageSelectButton.insertAdjacentHTML("beforebegin", previewHtml);
        } else {
          // -1でないとき=画像の変更
          // 既存のプレビュー要素
          const oldPreview = document.querySelector(`.image-preview[data-image-blob-id="${selectedImageBlobId}"]`);
          oldPreview.outerHTML = previewHtml; // 既存のプレビューを新しいプレビューで書き換える

          deleteImage(selectedImageBlobId); // 既存の画像を削除する
        }

        const insertedPreview = document.querySelector(`.image-preview[data-image-blob-id="${blob.id}"]`); // 追加したプレビューを取得する
        const insertedDeleteButton = insertedPreview.querySelector('.image-delete-button'); // 追加したプレビューの削除ボタンを取得する
        insertedDeleteButton.addEventListener('click', clickedDeleteButton); // 後から追加した削除ボタンにイベントを追加

        const insertedEditButton = insertedPreview.querySelector('.image-edit-button'); // 追加したプレビューの変更ボタンを取得する
        insertedEditButton.addEventListener('click', clickedEditButton); // 後から追加した変更ボタンにイベントを追加
      }
    })

    imageFileField.value = ''; // 送信する必要が無くchangeイベントの邪魔になるのでfile_fieldの中身を消去する
  }

  imageFileField.addEventListener('change', imageSelected); // file_fieldの内容が変化したら起動する

  const deleteButtons = document.querySelectorAll('.image-delete-button'); // 全ての削除ボタンを取得する
  deleteButtons.forEach((button) => { // 削除ボタンにイベントを設定していく
    button.addEventListener('click', clickedDeleteButton);
  });

  const editButtons = document.querySelectorAll('.image-edit-button'); // 全ての変更ボタンを取得する
  editButtons.forEach((button) => { // 変更ボタンにイベントを設定していく
    button.addEventListener('click', clickedEditButton);
  });

  imageSelectButton.addEventListener('click', () => { // 画像選択ボタンをクリックした時
    selectedImageBlobId = -1; // 選択した画像のblob_idをリセットしておく
  });

  postFormButton.addEventListener('click', (e) => { // 送信ボタンをクリックしたら起動する
    const previewImageLength = document.querySelectorAll('.image-preview').length; // プレビュー画像の枚数を数える
    if (previewImageLength < 1 || previewImageLength > 5) { // プレビュー画像が1枚未満、もしくは5枚より多いとき
      e.preventDefault(); // 送信ボタンの本来の挙動（フォームの送信）をキャンセルする
      alert("画像は1枚以上5枚以下にしてください。");
    }
  });

});
