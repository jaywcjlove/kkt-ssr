import path from 'path';
import React from 'react';
import express from 'express';
import { StaticRouter } from 'react-router-dom';
import { renderToString } from 'react-dom/server';
import { ChunkExtractor, ChunkExtractorManager } from '@loadable/server';
import App from './routes';

const server = express();
server
  .disable('x-powered-by')
  .use(express.static(process.env.KKT_PUBLIC_DIR))
  .get('/*', (req, res) => {
    const context = {};
    const extractor = new ChunkExtractor({ statsFile: path.resolve('dist/loadable-stats.json'), entrypoints: ['client'] });
    const markup = renderToString(
      <ChunkExtractorManager extractor={extractor}>
        <StaticRouter context={context} location={req.url}>
          <App />
        </StaticRouter>
      </ChunkExtractorManager>
    );

    if (context.url) {
      res.redirect(context.url);
    } else {
      res.status(200).send(`
<!doctype html>
  <html lang="">
  <head>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta charset="utf-8" />
    <title>Welcome to KKT</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    ${extractor.getLinkTags()}
    ${extractor.getStyleTags()}
  </head>
  <body>
    <div id="root">${markup}</div>
    ${extractor.getScriptTags()}
  </body>
</html>
      `);
    }
  });

export default server;
