class Api::V1::CommentsController < Api::V1::BaseController
  before_action :authenticate_user!, except: [:index]
  before_action :set_current_user_optional, only: [:index]
  before_action :set_post, only: [:index, :create]
  before_action :set_comment, only: [:update, :destroy]
  before_action :authorize_user!, only: [:update, :destroy]

  def index
    @comments = @post.comments.includes(:user, :replies => :user)
                      .where(parent_id: nil)
                      .order(created_at: :desc)

    render json: {
      data: @comments.map { |comment| comment_json(comment) }
    }, status: :ok
  end

  def create
    @comment = @post.comments.build(comment_params)
    @comment.user = current_user

    if @comment.save
      render json: { data: comment_json(@comment) }, status: :created
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def update
    if @comment.update(comment_params)
      render json: { data: comment_json(@comment) }, status: :ok
    else
      render json: { errors: @comment.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    @comment.destroy
    head :no_content
  end

  private

  def set_current_user_optional
    token = request.headers["Authorization"]&.split(" ")&.last
    return unless token

    begin
      payload = JWT.decode(token, ENV["DEVISE_JWT_SECRET_KEY"]).first
      @current_user = User.find(payload["sub"])
    rescue JWT::DecodeError, ActiveRecord::RecordNotFound
      @current_user = nil
    end
  end

  def set_post
    @post = Post.find(params[:post_id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Post not found" }, status: :not_found
  end

  def set_comment
    @comment = Comment.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { error: "Comment not found" }, status: :not_found
  end

  def authorize_user!
    unless @comment.user_id == current_user.id
      render json: { error: "You are not authorized to modify this comment" }, status: :forbidden
    end
  end

  def comment_params
    params.permit(:content, :parent_id)
  end

  def comment_json(comment)
    {
      id: comment.id,
      content: comment.content,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      parent_id: comment.parent_id,
      user: {
        id: comment.user.id,
        username: comment.user.username,
        avatar_url: comment.user.profile_avatar_url
      },
      replies_count: comment.replies.count,
      replies: comment.replies.order(created_at: :asc).map { |reply| comment_json(reply) }
    }
  end
end
