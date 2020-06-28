class PostsController < ApplicationController

  def index
    @posts= Post.all

    # ーーー追加ここからーーー
    wday = DateTime.now.wday  # 曜日（0:日曜日、 1:月曜日...6:土曜日）
    hour = DateTime.now.hour  # 時間
    minute = DateTime.now.minute  # 分

    if wday == 0 && hour == 21 && minute == 00  # 日曜日21時00分に実行
      unattached_files = ActiveStorage::Blob.unattached  ## 記事と結びついていないファイル
      seven_days_ago = DateTime.now.ago(7.day)  # 現在の日時から1週間前
      # 作成されたのが1週間以上前で記事と結びついていないファイルを取得
      unattached_files.where("active_storage_blobs.created_at <= ?", seven_days_ago).each do |file|
        ## データベースから削除する
        file.purge
      end
    end
    # ーーー追加ここまでーーー

  end

  def new
    @post = Post.new
  end

  def create
    @post = Post.new(post_params)
    if @post.save
      params[:post][:new_images]&.each do |image|
        @post.images.attach(image)
      end
      redirect_to root_path
    else
      render :new
    end
  end

  def edit
    @post = Post.find(params[:id])
  end

  def update
    @post = Post.find(params[:id])
    if @post.update(post_params)
      params[:post][:new_images]&.each do |image|
        @post.images.attach(image)
      end
      # ーーー追加ここからーーー
      params[:post][:delete_image_blob_ids]&.each do |blob_id|
        @post.images.find_by(blob_id: blob_id).purge
      end
      # ーーー追加ここからーーー
      redirect_to root_path
    else
      render :edit
    end
  end

  private

  def post_params
    params.require(:post).permit(:content, :images)
  end

end
