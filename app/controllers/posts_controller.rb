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
      # ーーーーー追加ここからーーーーーー
      params[:post][:new_images]&.each_with_index do |image|
        @post.images.attach(image)
      end
      # ーーーーー追加ここまでーーーーーー
      redirect_to root_path
    else
      render :new
    end
  end

  def edit
    @post = Post.find(params[:id])
  end

  def update
  end

  private

  def post_params
    params.require(:post).permit(:content, :images)
  end

end
