import { renderHook, act, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { useDemoFlow } from './useDemoFlow';
import type { ChatMessage } from './useChatState';

describe('useDemoFlow', () => {
  const mockOnMessagesAdd = vi.fn();
  const mockOnAgentStatusChange = vi.fn();
  const mockOnLeadNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start demo and show initial message', () => {
    const { result } = renderHook(() =>
      useDemoFlow(mockOnMessagesAdd, mockOnAgentStatusChange, mockOnLeadNotification)
    );

    act(() => {
      result.current.startDemo();
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.currentStep).toBe('onboarding_start');

    // Fast-forward past the initial delay
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // Should have called onMessagesAdd with the welcome message
    expect(mockOnMessagesAdd).toHaveBeenCalled();
  });

  it('should stop demo when stopDemo is called', () => {
    const { result } = renderHook(() =>
      useDemoFlow(mockOnMessagesAdd, mockOnAgentStatusChange, mockOnLeadNotification)
    );

    act(() => {
      result.current.startDemo();
    });

    expect(result.current.isRunning).toBe(true);

    act(() => {
      result.current.stopDemo();
    });

    expect(result.current.isRunning).toBe(false);
    expect(result.current.currentStep).toBe('idle');
  });

  it('should reach onboarding_followup and wait for confirm-profile action', async () => {
    const { result } = renderHook(() =>
      useDemoFlow(mockOnMessagesAdd, mockOnAgentStatusChange, mockOnLeadNotification)
    );

    // Start demo
    act(() => {
      result.current.startDemo();
    });

    // Wait for initial delay + messages
    act(() => {
      vi.advanceTimersByTime(500); // start delay
    });

    // Should be at onboarding_start
    expect(result.current.currentStep).toBe('onboarding_start');

    // Advance through auto-proceed steps
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should now be at onboarding_followup
    await waitFor(() => {
      expect(result.current.currentStep).toBe('onboarding_followup');
    });

    // Should be able to proceed (waiting for action)
    expect(result.current.canProceed).toBe(true);

    // Now trigger the confirm-profile action
    act(() => {
      result.current.handleAction('confirm-profile');
    });

    // Should have proceeded to next step
    await waitFor(() => {
      expect(result.current.currentStep).not.toBe('onboarding_followup');
    });
  });

  it('should handle confirm-persona action correctly', async () => {
    const { result } = renderHook(() =>
      useDemoFlow(mockOnMessagesAdd, mockOnAgentStatusChange, mockOnLeadNotification)
    );

    // Start demo and progress to task_followup
    act(() => {
      result.current.startDemo();
    });

    // Progress through all steps to reach task_followup
    act(() => {
      vi.advanceTimersByTime(500); // start
    });

    // onboarding_start -> onboarding_user_input
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // onboarding_user_input -> onboarding_followup
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Trigger confirm-profile
    act(() => {
      result.current.handleAction('confirm-profile');
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // onboarding_profile_confirmed -> task_creation_start -> task_user_input -> task_followup
    act(() => {
      vi.advanceTimersByTime(8000);
    });

    // Should be at task_followup
    await waitFor(() => {
      expect(result.current.currentStep).toBe('task_followup');
    });

    expect(result.current.canProceed).toBe(true);

    // Trigger confirm-persona
    act(() => {
      result.current.handleAction('confirm-persona');
    });

    // Should proceed
    await waitFor(() => {
      expect(result.current.currentStep).not.toBe('task_followup');
    });
  });

  it('should handle confirm-plan action correctly', async () => {
    const { result } = renderHook(() =>
      useDemoFlow(mockOnMessagesAdd, mockOnAgentStatusChange, mockOnLeadNotification)
    );

    // Start demo
    act(() => {
      result.current.startDemo();
    });

    // Progress through steps to reach strategy_generated
    const steps = [
      { delay: 500 }, // start
      { delay: 3000 }, // onboarding_start
      { delay: 5000 }, // onboarding_user_input
      { action: 'confirm-profile' },
      { delay: 3000 }, // onboarding_profile_confirmed
      { delay: 5000 }, // task_creation_start + task_user_input
      { action: 'confirm-persona' },
      { delay: 5000 }, // coordinating_agents + thinking
    ];

    for (const step of steps) {
      if ('delay' in step) {
        act(() => {
          vi.advanceTimersByTime(step.delay);
        });
      } else if ('action' in step) {
        act(() => {
          result.current.handleAction(step.action as string);
        });
      }
    }

    // Should be at strategy_generated
    await waitFor(() => {
      expect(result.current.currentStep).toBe('strategy_generated');
    });

    expect(result.current.canProceed).toBe(true);

    // Trigger confirm-plan
    act(() => {
      result.current.handleAction('confirm-plan');
    });

    // Should proceed to strategy_confirmed
    await waitFor(() => {
      expect(result.current.currentStep).toBe('strategy_confirmed');
    });
  });

  it('should not proceed when clicking wrong action', async () => {
    const { result } = renderHook(() =>
      useDemoFlow(mockOnMessagesAdd, mockOnAgentStatusChange, mockOnLeadNotification)
    );

    // Start and progress to onboarding_followup
    act(() => {
      result.current.startDemo();
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(result.current.currentStep).toBe('onboarding_followup');
    });

    // Try wrong action
    act(() => {
      result.current.handleAction('wrong-action');
    });

    // Should still be at same step
    expect(result.current.currentStep).toBe('onboarding_followup');
  });
});
