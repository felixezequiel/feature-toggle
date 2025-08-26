import { Test, TestingModule } from '@nestjs/testing';
import { FeatureFlagController } from '../../src/feature-flag/feature-flag.controller';
import { FeatureFlagService } from '../../src/feature-flag/feature-flag.service';
import { ConfigService } from '@nestjs/config';

describe('FeatureFlagController', () => {
    let controller: FeatureFlagController;
    let service: FeatureFlagService;
    let configService: ConfigService;

    const mockFeatureFlagService = {
        getFeatureFlags: jest.fn(),
        isEnabled: jest.fn(),
        getVariant: jest.fn(),
        getFeatureFlagEvents: jest.fn(),
        emitTestEvent: jest.fn(),
        emitHeartbeat: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [FeatureFlagController],
            providers: [
                {
                    provide: FeatureFlagService,
                    useValue: mockFeatureFlagService,
                },
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
            ],
        }).compile();

        controller = module.get<FeatureFlagController>(FeatureFlagController);
        service = module.get<FeatureFlagService>(FeatureFlagService);
        configService = module.get<ConfigService>(ConfigService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('getFeatureFlags', () => {
        it('should return feature flags from service', () => {
            const mockFlags = ['feature1', 'feature2', 'feature3'];
            jest.spyOn(service, 'getFeatureFlags').mockReturnValue(mockFlags);

            const result = controller.getFeatureFlags();

            expect(result).toEqual(mockFlags);
            expect(service.getFeatureFlags).toHaveBeenCalledTimes(1);
        });
    });

    describe('isEnabled', () => {
        it('should check if feature flag is enabled with user context', () => {
            const featureName = 'dark-mode';
            const userId = 'user123';
            const email = 'user@example.com';
            const environment = 'production';

            jest.spyOn(service, 'isEnabled').mockReturnValue(true);
            jest.spyOn(service, 'getVariant').mockReturnValue('enabled');

            const result = controller.isEnabled(featureName, userId, email, environment);

            expect(result).toEqual({
                name: featureName,
                enabled: true,
                variant: 'enabled',
            });

            expect(service.isEnabled).toHaveBeenCalledWith(featureName, {
                userId,
                email,
                environment,
            });
            expect(service.getVariant).toHaveBeenCalledWith(featureName, {
                userId,
                email,
                environment,
            });
        });

        it('should check if feature flag is enabled without user context', () => {
            const featureName = 'dark-mode';

            jest.spyOn(service, 'isEnabled').mockReturnValue(false);
            jest.spyOn(service, 'getVariant').mockReturnValue('disabled');

            const result = controller.isEnabled(featureName);

            expect(result).toEqual({
                name: featureName,
                enabled: false,
                variant: 'disabled',
            });

            expect(service.isEnabled).toHaveBeenCalledWith(featureName, undefined);
            expect(service.getVariant).toHaveBeenCalledWith(featureName, undefined);
        });

        it('should handle partial user context', () => {
            const featureName = 'dark-mode';
            const userId = 'user123';

            jest.spyOn(service, 'isEnabled').mockReturnValue(true);
            jest.spyOn(service, 'getVariant').mockReturnValue('enabled');

            const result = controller.isEnabled(featureName, userId);

            expect(result).toEqual({
                name: featureName,
                enabled: true,
                variant: 'enabled',
            });

            expect(service.isEnabled).toHaveBeenCalledWith(featureName, { userId });
            expect(service.getVariant).toHaveBeenCalledWith(featureName, { userId });
        });
    });

    describe('featureFlagEvents', () => {
        it('should return feature flag events stream', () => {
            const mockObservable = {
                subscribe: jest.fn(),
            } as any;
            jest.spyOn(service, 'getFeatureFlagEvents').mockReturnValue(mockObservable);

            const result = controller.featureFlagEvents();

            expect(result).toBe(mockObservable);
            expect(service.getFeatureFlagEvents).toHaveBeenCalledTimes(1);
        });
    });

    describe('testEvent', () => {
        it('should emit test event and return success message', () => {
            jest.spyOn(service, 'emitTestEvent').mockImplementation(() => { });

            const result = controller.testEvent();

            expect(result).toEqual({ message: 'Evento de teste emitido' });
            expect(service.emitTestEvent).toHaveBeenCalledTimes(1);
        });
    });

    describe('emitHeartbeat', () => {
        it('should emit heartbeat and return success message', () => {
            jest.spyOn(service, 'emitHeartbeat').mockImplementation(() => { });

            const result = controller.emitHeartbeat();

            expect(result).toEqual({ message: 'Heartbeat emitido' });
            expect(service.emitHeartbeat).toHaveBeenCalledTimes(1);
        });
    });

    describe('getStatus', () => {
        it('should return service status', () => {
            const result = controller.getStatus();

            expect(result).toHaveProperty('status', 'active');
            expect(result).toHaveProperty('timestamp');
            expect(result).toHaveProperty('message', 'Feature Flag Service ativo e funcionando');
            expect(new Date(result.timestamp)).toBeInstanceOf(Date);
        });
    });
});
