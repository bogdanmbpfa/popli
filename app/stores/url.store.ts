import orderBy from 'lodash/orderBy';

import { ELinkType } from '~~/enums';
import type { ILink } from '~~/interfaces';

export const useUrlStore = defineStore('url', {
  state: () => ({
    primaryLinks: [] as ILink[],
    secondaryLinks: [] as ILink[],
  }),
  getters: {
    getPrimaryLinks: (state): ILink[] => state.primaryLinks,
    getSecondaryLinks: (state): ILink[] => state.secondaryLinks,
  },
  actions: {
    addLink(link: ILink): void {
      if (link.type === ELinkType.PRIMARY) {
        this.primaryLinks.push(link);
      } else {
        this.secondaryLinks.push(link);
      }

      this.orderLinks();
    },
    setLinks(links: ILink[]): void {
      this.primaryLinks = links.filter((l) => l.type === ELinkType.PRIMARY);
      this.secondaryLinks = links.filter((l) => l.type === ELinkType.SECONDARY);

      this.orderLinks();
    },
    decrementPosition(type: ELinkType, link: ILink): void {
      const links = type === ELinkType.PRIMARY ? this.primaryLinks : this.secondaryLinks;
      const index = links.findIndex((l) => l.id === link.id);
      const previousLink = links.find(
        (l) => l.position === link.position + 1,
      );
      if (index !== -1) {
        links[index]!.position += 1;
      }

      if (previousLink) {
        const previousLinkIndex = links.findIndex(
          (l) => l.id === previousLink.id,
        );
        if (previousLinkIndex !== -1) {
          links[previousLinkIndex]!.position -= 1;
        }
      }

      this.orderLinks();
    },
    incrementPosition(type: ELinkType, link: ILink): void {
      const links = type === ELinkType.PRIMARY ? this.primaryLinks : this.secondaryLinks;
      const index = links.findIndex((l) => l.id === link.id);
      const nextLink = links.find((l) => l.position === link.position - 1);
      if (index !== -1) {
        links[index]!.position -= 1;
      }

      if (nextLink) {
        const nextLinkIndex = links.findIndex((l) => l.id === nextLink.id);
        if (nextLinkIndex !== -1) {
          links[nextLinkIndex]!.position += 1;
        }
      }

      this.orderLinks();
    },
    updateLink(type: ELinkType, link: ILink): void {
      const links = type === ELinkType.PRIMARY ? this.primaryLinks : this.secondaryLinks;
      const index = links.findIndex((l) => l.id === link.id);
      if (index !== -1) {
        links[index] = link;
      }
    },
    deleteLink(type: ELinkType, link: ILink): void {
      const links = type === ELinkType.PRIMARY ? this.primaryLinks : this.secondaryLinks;
      const index = links.findIndex((l) => l.id === link.id);
      if (index !== -1) {
        links.splice(index, 1);

        for (const l of links) {
          if (l.position > link.position) {
            l.position -= 1;
          }
        }
      }
    },
    orderLinks(): void {
      this.primaryLinks = orderBy(this.primaryLinks, 'position', 'asc');
      this.secondaryLinks = orderBy(this.secondaryLinks, 'position', 'asc');
    },
  },
});
