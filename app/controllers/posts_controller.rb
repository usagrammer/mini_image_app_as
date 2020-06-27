class PostsController < ApplicationController

  def index
    @posts= Post.all
  end

  def new
    @post = Post.new
  end

  def create
    @post = Post.new(post_params)
    if @post.save
      params[:post][:new_images]&.each_with_index do |image|
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
      params[:post][:new_images]&.each_with_index do |image|
        @post.images.attach(image)
      end
      # ーーー追加ここからーーー
      params[:post][:delete_image_blob_ids]&.each_with_index do |blob_id|
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
