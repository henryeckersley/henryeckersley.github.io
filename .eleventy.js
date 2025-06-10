module.exports = function(eleventyConfig) {
  // Copy unprocessed assets like PDFs
  eleventyConfig.addPassthroughCopy({ 'src/assets/resumes': 'assets/resumes' });
  return {
    dir: {
      input: 'src',
      output: 'dist'
    }
  };
};
