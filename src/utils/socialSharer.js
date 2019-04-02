const socialSharer = (medium, data) => {
  let sharerUrl = null;
  let url = null;
  let text = null;
  switch (medium) {
    case 'facebook':
      url = `https://www.facebook.com/sharer.php?u=${data.url}`;
      text = `&amp;title=Job Opening(%20${data.text.replace(/ /g, '%20')}%20)`;
      break;
    case 'linkedin':
      url = `https://www.linkedin.com/shareArticle?mini=true&amp;url=${data.url}`;
      text = `&amp;title=Job Opening(%20${data.text.substring(0, 150).replace(/ /g, '%20')}%20)
      &amp;summary=${data.description.substring(0, 170)}`;
      break;
    case 'twitter':
      url = `https://twitter.com/share?url=${data.url}`;
      text = `&amp;text=Job Opening(%20${data.text.replace(/ /g, '%20')}%20)%20-%20
      ${data.description.substring(0, 170)}`;
      break;
    case 'xing':
      url = `https://www.xing-share.com/app/user?op=share;sc_p=xing-share;url=${data.url}`;
      break;
    default:
      sharerUrl = null;
      url = null;
      text = null;
  }
  sharerUrl = `${url}${text || ''}`;
  return sharerUrl;
};

export default socialSharer;
