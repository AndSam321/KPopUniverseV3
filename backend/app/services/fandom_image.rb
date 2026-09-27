module FandomImage
  HOST = "static.wikia.nocookie.net"
  REVISION = "/revision/latest"

  module_function

  def thumbnail(url, width:)
    return url if url.blank? || !url.include?(HOST) || url.include?("/scale-to-width-down/")

    url.sub(REVISION, "#{REVISION}/scale-to-width-down/#{width}")
  end
end
