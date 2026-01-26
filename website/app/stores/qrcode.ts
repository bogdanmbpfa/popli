import { defineStore } from 'pinia';
import type { CornerDotType, CornerSquareType, DotType } from 'qr-code-styling';

interface Data {
	backgroundBorderRadius: number;
	backgroundColor: string;
	backgroundColorType: 'solid' | 'gradient';
	backgroundGradient: {
		rotation: number;
		stops: { color: string; offset: number }[];
	};
	colorPreset: 'classic' | 'blue' | 'purple' | 'pink' | 'darkMode' | 'ocean' | 'forest' | 'sunset' | null;
	cornerDotsColor: string;
	cornerDotsColorType: 'solid' | 'gradient';
	cornerDotsGradient: {
		rotation: number;
		stops: { color: string; offset: number }[];
	};
	cornerDotsType: CornerDotType;
	cornerSquaresColor: string;
	cornerSquaresColorType: 'solid' | 'gradient';
	cornerSquaresGradient: {
		rotation: number;
		stops: { color: string; offset: number }[];
	};
	cornerSquaresType: CornerSquareType;
	dotsColor: string;
	dotsColorType: 'solid' | 'gradient';
	dotsGradient: {
		rotation: number;
		stops: { color: string; offset: number }[];
	};
	dotsType: DotType;
	foregroundColor: string;
	foregroundColorType: 'solid' | 'gradient';
	foregroundGradient: {
		rotation: number;
		stops: { color: string; offset: number }[];
	};
	image: File | null;
	imageSize: number;
	imageUrl: string | null;
	width: number;
}

export const useQrCodeStore = defineStore('qrcode', {
	state: () => ({
		data: null as Data | null,
	}),
	getters: {
		getData: (state): Data | null => state.data,
	},
	actions: {
		setData(data: Data | null): void {
			this.data = data;
		},
	},
});
