class Post < ApplicationRecord
  has_many_attached :images
  validates :content, presence: true
  validate :post_images

  def post_images
    if images.length > 5 || images.length < 0
      errors.add(:images, "画像の枚数が不正です")
    end
  end

end
