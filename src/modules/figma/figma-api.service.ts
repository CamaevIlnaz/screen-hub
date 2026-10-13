import { Injectable } from '@nestjs/common';

const FIGMA_API_URL = 'https://api.figma.com/v1';
const REQUEST_TIMEOUT_MS = 120_000;

export type FigmaNode = {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
};

export type FigmaNodeTree = {
  lastModified: Date;
  node: FigmaNode;
};

type FigmaNodesResponse = {
  lastModified: string;
  nodes: Record<string, { document: FigmaNode } | null>;
};

type FigmaImagesResponse = {
  err: string | null;
  images: Record<string, string | null>;
};

export class FigmaApiError extends Error {}

@Injectable()
export class FigmaApiService {
  async getNodeTree(
    token: string,
    fileKey: string,
    nodeId: string,
  ): Promise<FigmaNodeTree> {
    const response = await this.request<FigmaNodesResponse>(
      token,
      `/files/${fileKey}/nodes`,
      { ids: nodeId, depth: '2' },
    );

    const node = response.nodes[nodeId]?.document;
    if (!node) {
      throw new FigmaApiError(`Нода ${nodeId} не найдена в файле ${fileKey}`);
    }

    return { lastModified: new Date(response.lastModified), node };
  }

  async getSvgUrls(
    token: string,
    fileKey: string,
    nodeIds: string[],
  ): Promise<Record<string, string | null>> {
    const response = await this.request<FigmaImagesResponse>(
      token,
      `/images/${fileKey}`,
      { ids: nodeIds.join(','), format: 'svg' },
    );

    if (response.err) {
      throw new FigmaApiError(response.err);
    }

    return response.images;
  }

  async download(url: string): Promise<Buffer> {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new FigmaApiError(`Ошибка скачивания файла: ${response.status}`);
    }

    return Buffer.from(await response.arrayBuffer());
  }

  private async request<T>(
    token: string,
    path: string,
    params: Record<string, string>,
  ): Promise<T> {
    const url = `${FIGMA_API_URL}${path}?${new URLSearchParams(params)}`;

    let response: Response;
    try {
      response = await fetch(url, {
        headers: { 'X-Figma-Token': token },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });
    } catch (error) {
      throw new FigmaApiError(
        `Figma API недоступен: ${error instanceof Error ? error.message : String(error)}`,
      );
    }

    if (!response.ok) {
      const body = await response.text();
      throw new FigmaApiError(`Figma API ${response.status}: ${body}`);
    }

    return (await response.json()) as T;
  }
}
